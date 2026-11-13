import { test, expect } from "@playwright/test";

const teamId = "111111111111111111111111", areaId = "222222222222222222222222", campaignId = "333333333333333333333333";
const assignmentId = "444444444444444444444444";
const reply = (route, data) => route.fulfill({ json: { success: true, data } });

async function login(page, user) {
  await page.addInitScript(user => {
    localStorage.setItem("pcp-auth", JSON.stringify({ user, accessToken: "test-only" }));
    localStorage.setItem("aic-language", "en");
  }, user);
}

async function teamFixture(page, type, enabledDay = 1) {
  await login(page, { _id: teamId, role: "FieldTeam", teamType: type, teamNo: "01", username: "1234567890123" });
  const state = { enabledDay, reads: [], writes: [] };
  await page.route("**/api/v1/**", async route => {
    const request = route.request(), url = new URL(request.url());
    if (url.pathname.endsWith("/context/bootstrap")) return reply(route, {
      role: "FieldTeam", areaId, campaign: { _id: campaignId, campaignName: "Test campaign", status: "Active" }, enabledDay: state.enabledDay,
      assignments: [1,2].map(day => ({ assignmentId: day === 1 ? assignmentId : "555555555555555555555555", campaignId, areaId,
        campaignDay: day, teamType: type, assignmentType: type === "Mobile" ? "Route" : "Point", label: `Assignment ${day}`,
        planningStatus: "Finalized", sheetStatus: "Not started" }))
    });
    if (url.pathname.includes("/geography/")) return reply(route, { routes: [], points: [] });
    if (url.pathname.includes("-sheets/")) {
      if (request.method() === "GET") state.reads.push(url.pathname);
      else state.writes.push({ path: url.pathname, data: request.postDataJSON() });
      return reply(route, { _id: "666666666666666666666666", campaign: campaignId, team: teamId, campaignDay: 1,
        route: assignmentId, point: assignmentId, status: "Draft", snapshot: { campaignName: "Test campaign" },
        headOfFirstHouse: "First", headOfLastHouse: "Last", households: [], schools: [], unvaccinatedChildren: [],
        vaccinatedChildren: [], vaccinatedChildrenCount: 0, summary: {}, logistics: {} });
    }
    return reply(route, {});
  });
  return state;
}

for (const [type, path] of [["Mobile", "tally-sheet"], ["Fixed", "fixed-sheet"], ["Transit", "transit-sheet"]]) {
  test(`${type} automatically opens and saves only the enabled day`, async ({ page }) => {
    const state = await teamFixture(page, type);
    await page.goto(`/dashboard/team/${path}`);
    await expect(page.getByText("Day 1 is enabled", { exact: true })).toBeVisible();
    const save = page.getByRole("button", { name: "Save Draft", exact: true });
    await expect(save).toBeEnabled();
    await expect(page.getByText("Assignment 2", { exact: true })).toHaveCount(0);
    await save.click();
    await expect.poll(() => state.writes.length).toBe(1);
    expect(state.writes[0].path).toContain("/day/1");
    expect(state.reads.every(path => path.endsWith("/day/1"))).toBeTruthy();
  });
}

test("no enabled day means no sheet is opened", async ({ page }) => {
  const state = await teamFixture(page, "Mobile", null);
  await page.goto("/dashboard/team/tally-sheet");
  await expect(page.getByText("No working day is enabled", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Save Draft", exact: true })).toHaveCount(0);
  expect(state.reads).toEqual([]);
});

test("changing the enabled day preserves an open form and prevents saving it", async ({ page }) => {
  const state = await teamFixture(page, "Mobile");
  await page.goto("/dashboard/team/tally-sheet");
  const input = page.locator('input[name="headOfFirstHouse"]');
  await expect(input).toBeEnabled();
  await input.fill("Unsaved house");
  state.enabledDay = 2;
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect(page.getByText("Day 2 is enabled", { exact: true })).toBeVisible();
  await expect(input).toHaveValue("Unsaved house");
  await expect(input).toBeDisabled();
  await expect(page.getByRole("button", { name: "Save Draft", exact: true })).toBeDisabled();
  expect(state.reads.every(path => path.endsWith("/day/1"))).toBeTruthy();
});


async function aicFixture(page, count = 3) {
  await login(page, { _id: "777777777777777777777777", role: "AIC", aicName: "Test AIC", aicNo: "01" });
  const rows = Array.from({ length: count }, (_, index) => ({
    teamId: (index + 10).toString(16).padStart(24, "0"), teamNo: String(index + 1).padStart(2, "0"),
    teamType: ["Mobile", "Fixed", "Transit"][index % 3], assignment: "Location " + (index + 1),
    assignmentCount: 1, planningReady: true, status: "Finalized", unfinishedSheets: 0,
    enabledDay: null, lastDay: null, dayStatus: "Not enabled", canEnable: true, canClose: false
  }));
  const fixture = { writes: [], reject: false, state: { revision: 0, campaignStatus: "Active", history: [], days: [{ day: 1, rows }, { day: 2, rows: [] }] } };
  await page.route("**/api/v1/**", async route => {
    if (route.request().url().includes("/context/bootstrap")) return reply(route, { areaId, campaign: { _id: campaignId, status: "Active" } });
    if (route.request().url().includes("/field-days/")) {
      if (route.request().method() === "PATCH") {
        const body = route.request().postDataJSON();
        fixture.writes.push(body);
        if (fixture.reject) return route.fulfill({ status: 409, json: { message: "The field day changed. Refresh and try again." } });
        for (const row of rows.filter(row => body.teamIds.includes(row.teamId))) {
          row.enabledDay = body.action === "enable" ? body.day : null;
          row.lastDay = body.day;
          row.canEnable = false;
          row.canClose = body.action === "enable";
          row.dayStatus = body.action === "enable" ? "Enabled" : "Closed";
        }
        fixture.state.revision++;
      }
      return reply(route, fixture.state);
    }
    return reply(route, []);
  });
  await page.goto("/dashboard/aic/field-days");
  await expect(page.getByRole("link", { name: "Manage Field Day" })).toBeVisible();
  await expect(page.locator("tbody tr").first()).toContainText("01");
  return fixture;
}

test("individual enable and close require confirmation and affect only that team", async ({ page }) => {
  const fixture = await aicFixture(page);
  const row = page.locator("tbody tr").first();
  await row.getByRole("button", { name: "Enable day", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("dialog").getByRole("listitem")).toHaveCount(1);
  await page.getByRole("dialog").getByRole("button", { name: "Cancel", exact: true }).click();
  expect(fixture.writes).toHaveLength(0);
  await row.getByRole("button", { name: "Enable day", exact: true }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Confirm", exact: true }).click();
  await expect(row.getByRole("button", { name: "Close day", exact: true })).toBeEnabled();
  expect(fixture.writes[0]).toMatchObject({ action: "enable", day: 1, revision: 0, teamIds: [fixture.state.days[0].rows[0].teamId] });
  await expect(page.locator("tbody tr").nth(1).getByRole("button", { name: "Enable day", exact: true })).toBeEnabled();
  await row.getByRole("button", { name: "Close day", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("Close Day 1");
  await page.getByRole("dialog").getByRole("button", { name: "Confirm", exact: true }).click();
  await expect(row).toContainText("Closed");
  expect(fixture.writes[1].teamIds).toEqual(fixture.writes[0].teamIds);
});

test("bulk enable and close confirm only selected teams", async ({ page }) => {
  const fixture = await aicFixture(page);
  for (const index of [0,1]) await page.locator("tbody tr").nth(index).getByRole("checkbox").check();
  await page.getByRole("button", { name: "Enable selected", exact: true }).click();
  await expect(page.getByRole("dialog").getByRole("listitem")).toHaveCount(2);
  await page.getByRole("dialog").getByRole("button", { name: "Confirm", exact: true }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  expect(fixture.writes[0].teamIds).toEqual(fixture.state.days[0].rows.slice(0,2).map(row => row.teamId));
  await expect(page.locator("tbody tr").nth(2).getByRole("button", { name: "Enable day", exact: true })).toBeEnabled();
  for (const index of [0,1]) await page.locator("tbody tr").nth(index).getByRole("checkbox").check();
  await page.getByRole("button", { name: "Close selected", exact: true }).click();
  await expect(page.getByRole("dialog").getByRole("listitem")).toHaveCount(2);
  await page.getByRole("dialog").getByRole("button", { name: "Confirm", exact: true }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  expect(fixture.writes[1].teamIds).toEqual(fixture.writes[0].teamIds);
});

test("filters, numeric sorting and pagination clear hidden selections", async ({ page }) => {
  const fixture = await aicFixture(page, 15);
  await expect(page.getByRole("searchbox")).not.toBeVisible();
  await expect(page.locator("tbody tr")).toHaveCount(10);
  await page.getByRole("checkbox", { name: "Select eligible teams on this page" }).check();
  await expect(page.getByText("10 team(s) selected", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.locator("tbody tr")).toHaveCount(5);
  await expect(page.getByText("0 team(s) selected", { exact: true })).toBeVisible();
  await page.getByText("Filters and sorting", { exact: true }).click();
  await page.getByRole("combobox", { name: "Sort order", exact: true }).selectOption("desc");
  await expect(page.locator("tbody tr").first()).toHaveAttribute("data-team-id", fixture.state.days[0].rows[14].teamId);
  await page.getByRole("searchbox").fill("Location 15");
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await page.getByRole("searchbox").fill("no-match");
  await expect(page.getByText("No teams match this day and these filters.")).toBeVisible();
  await page.getByRole("searchbox").fill("");
  await page.getByRole("combobox", { name: "Team Type", exact: true }).selectOption("Mobile");
  await expect(page.locator("tbody tr")).toHaveCount(5);
  await page.getByRole("checkbox", { name: "Select eligible teams on this page" }).check();
  await page.getByRole("combobox", { name: "Campaign Day", exact: true }).selectOption("2");
  await expect(page.getByText("0 team(s) selected", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Enable selected", exact: true })).toBeDisabled();
});

test("a rejected stale confirmation leaves team states unchanged", async ({ page }) => {
  const fixture = await aicFixture(page);
  fixture.reject = true;
  await page.locator("tbody tr").first().getByRole("button", { name: "Enable day", exact: true }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Confirm", exact: true }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(page.locator("tbody tr").first().getByRole("button", { name: "Enable day", exact: true })).toBeEnabled();
  expect(fixture.state.revision).toBe(0);
});
