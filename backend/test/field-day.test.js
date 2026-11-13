import assert from "node:assert/strict";
import { test } from "node:test";
import mongoose from "mongoose";
import { Area } from "../src/modules/areas/area.model.js";
import { Campaign } from "../src/modules/campaigns/campaign.model.js";
import { Team } from "../src/modules/teams/team.model.js";
import { Route, Point } from "../src/modules/geography/geography.model.js";
import { OMP } from "../src/modules/omp/omp.model.js";
import { TallySheet } from "../src/modules/tallySheet/tallySheet.model.js";
import { FixedSheet } from "../src/modules/fixedSheet/fixedSheet.model.js";
import { TransitSheet } from "../src/modules/transitSheet/transitSheet.model.js";
import { getTeamDayState } from "../src/modules/fieldDay/fieldDay.state.js";
import { assertEnabledFieldDay } from "../src/modules/fieldDay/fieldDay.guard.js";
import { assertDayReady, changeFieldDay, getFieldDays, getDayRoster } from "../src/modules/fieldDay/fieldDay.service.js";
import { saveTallySheetDraft, finalizeTallySheet } from "../src/modules/tallySheet/tallySheet.service.js";
import { saveFixedSheetDraft, finalizeFixedSheet } from "../src/modules/fixedSheet/fixedSheet.service.js";
import { saveTransitSheetDraft, finalizeTransitSheet } from "../src/modules/transitSheet/transitSheet.service.js";

const id = () => new mongoose.Types.ObjectId();
const areaId = id(), campaignId = id(), aicId = id(), teamId = id(), assignmentId = id();
const aic = { _id: aicId, role: "AIC" };
const actor = { _id: teamId, role: "FieldTeam", registeredBy: aicId, teamType: "Fixed" };
const assignment = { _id: assignmentId, area: areaId, campaign: campaignId, team: teamId, campaignDay: 1 };
const chain = value => ({ select() { return this; }, session() { return this; }, then(resolve, reject) { return Promise.resolve(value).then(resolve, reject); } });
const ready = { rows: [{ assignmentCount: 1, planningReady: true, status: "Finalized" }], unfinishedSheets: 0 };

test("legacy day state is preserved until conversion; new teams do not inherit enabled days after conversion", () => {
    const legacy = { fieldDay: { enabledDay: 2, lastDay: 2 } };
    assert.deepEqual(getTeamDayState(legacy, teamId, "Mobile"), { enabledDay: 2, lastDay: 2 });
    assert.deepEqual(getTeamDayState({ fieldDay: { enabledDay: 4, lastDay: 4 } }, teamId, "Mobile"), { enabledDay: null, lastDay: 3 });
    const migrated = { fieldDay: { teamControlVersion: 1, enabledDay: 2, teams: [{ team: teamId, enabledDay: 1, lastDay: 1 }] } };
    assert.equal(getTeamDayState(migrated, teamId, "Fixed").enabledDay, 1);
    assert.deepEqual(getTeamDayState(migrated, id(), "Fixed"), { enabledDay: null, lastDay: null });
});

test("global calls, duplicate IDs, invalid IDs and oversized selections are rejected before database access", async t => {
    const start = t.mock.method(mongoose, "startSession", () => { throw Error("must not start"); });
    for (const teamIds of [undefined, [], [String(teamId), String(teamId)], [{ $ne: null }], Array.from({ length: 101 }, () => String(id()))]) {
        await assert.rejects(changeFieldDay(String(areaId), aic, { action: "enable", day: 1, revision: 0, teamIds }), e => e.statusCode === 400);
    }
    assert.equal(start.mock.callCount(), 0);
});

test("field day readiness blocks unfinished sheets, missing assignments, and unfinalized planning", () => {
    assert.doesNotThrow(() => assertDayReady(ready, "enable"));
    assert.doesNotThrow(() => assertDayReady(ready, "close"));
    for (const status of ["Not started", "Draft"]) {
        assert.throws(() => assertDayReady({ ...ready, rows: [{ ...ready.rows[0], status }] }, "close"), /must be finalized/);
    }
    assert.throws(() => assertDayReady({ ...ready, unfinishedSheets: 1 }, "close"), /must be finalized/);
    for (const assignmentCount of [0, 2]) assert.throws(() => assertDayReady({ ...ready, rows: [{ ...ready.rows[0], assignmentCount }] }, "enable"), /exactly one/);
    assert.throws(() => assertDayReady({ ...ready, rows: [{ ...ready.rows[0], planningReady: false }] }, "enable"), /OMPs/);
});

test("day management rejects non-AIC users and malformed scope before querying", async t => {
    const find = t.mock.method(Area, "findOne", () => { throw Error("unexpected query"); });
    await assert.rejects(getFieldDays(String(areaId), actor), e => e.statusCode === 403);
    await assert.rejects(getFieldDays({ $ne: null }, aic), e => e.statusCode === 400);
    assert.equal(find.mock.callCount(), 0);
});

test("another AIC cannot manage an area", async t => {
    const find = t.mock.method(Area, "findOne", () => chain(null));
    await assert.rejects(getFieldDays(String(areaId), aic), e => e.statusCode === 404);
    assert.deepEqual(find.mock.calls[0].arguments[0], { _id: String(areaId), aic: aicId });
});

test("team writes lock the enabled area in the same transaction", async t => {
    const session = {};
    const update = t.mock.method(Area, "findOneAndUpdate", async () => ({ _id: areaId, fieldDay: { teamControlVersion: 1, teams: [{ team: teamId, enabledDay: 1 }] } }));
    await assertEnabledFieldDay({ assignment, campaignDay: 1, actor, session, write: true });
    const [scope, mutation, options] = update.mock.calls[0].arguments;
    assert.deepEqual(scope, { _id: areaId, campaign: campaignId, aic: aicId });
    assert.equal(mutation.$inc["fieldDay.writeSerial"], 1);
    assert.equal(options.session, session);
});

test("stale/offline writes to a closed day are rejected and supervisor corrections remain possible", async t => {
    t.mock.method(Area, "findOneAndUpdate", async () => null);
    await assert.rejects(assertEnabledFieldDay({ assignment, campaignDay: 2, actor, session: {}, write: true }), e => e.statusCode === 409);
    await assert.rejects(assertEnabledFieldDay({ assignment, campaignDay: 1, actor, write: true }), e => e.statusCode === 503);
    await assert.doesNotReject(assertEnabledFieldDay({ assignment, campaignDay: 1, actor: aic }));
});

const stubManagement = (t, state, status = "Active") => {
    const area = { _id: areaId, campaign: campaignId, aic: aicId, fieldDay: state };
    t.mock.method(mongoose, "startSession", async () => ({ withTransaction: async work => work(), endSession: async () => {} }));
    t.mock.method(Area, "findOne", () => chain(area));
    t.mock.method(Campaign, "findById", () => chain({ _id: campaignId, status }));
    t.mock.method(Team, "find", () => chain([{ _id: teamId, teamNo: "01", teamType: "Fixed" }]));
    t.mock.method(Route, "find", () => chain([]));
    t.mock.method(Point, "find", () => chain([{ ...assignment, pointNo: "01", pointName: "Clinic", pointType: "Fixed" }]));
    t.mock.method(OMP, "find", () => chain([]));
    t.mock.method(TallySheet, "find", () => chain([]));
    t.mock.method(FixedSheet, "find", () => chain([{ team: teamId, point: assignmentId, status: "Finalized" }]));
    t.mock.method(TransitSheet, "find", () => chain([]));
    return t.mock.method(Area, "updateOne", async () => ({ modifiedCount: 1 }));
};

test("enabling records the owning actor and audit event", async t => {
    const update = stubManagement(t, {});
    await changeFieldDay(String(areaId), aic, { action: "enable", day: 1, revision: 0, teamIds: [String(teamId)] });
    const [, change, options] = update.mock.calls[1].arguments;
    assert.equal(change.$set["fieldDay.teams"][0].enabledDay, 1);
    assert.equal(change.$set["fieldDay.teamControlVersion"], 1);
    assert.deepEqual(change.$push["fieldDay.history"].teams, [teamId]);
    assert.equal(change.$push["fieldDay.history"].actor, aicId);
    assert.equal(change.$push["fieldDay.history"].action, "enable");
    assert.ok(options.session);
});

for (const [label, state, input, status] of [
    ["stale revision", { revision: 1 }, { action: "enable", day: 1, revision: 0, teamIds: [String(teamId)] }, "Active"],
    ["second enabled day", { enabledDay: 1 }, { action: "enable", day: 2, revision: 0 }, "Active"],
    ["skipping days", { lastDay: 1 }, { action: "enable", day: 3, revision: 0 }, "Active"],
    ["closing another day", { enabledDay: 1 }, { action: "close", day: 2, revision: 0 }, "Active"],
    ["paused campaign", {}, { action: "enable", day: 1, revision: 0, teamIds: [String(teamId)] }, "Paused"],
    ["completed campaign", {}, { action: "enable", day: 1, revision: 0, teamIds: [String(teamId)] }, "Completed"]
]) test(`rejects ${label} without mutating the day`, async t => {
    const update = stubManagement(t, state, status);
    await assert.rejects(changeFieldDay(String(areaId), aic, { ...input, teamIds: [String(teamId)] }), e => [403,409].includes(e.statusCode));
    assert.equal(update.mock.callCount(), 0);
});

test("closing a completed day clears the enabled day and retains its history", async t => {
    const update = stubManagement(t, { enabledDay: 1, lastDay: 1, revision: 1 });
    await changeFieldDay(String(areaId), aic, { action: "close", day: 1, revision: 1, teamIds: [String(teamId)] });
    const change = update.mock.calls[1].arguments[1];
    assert.equal(change.$set["fieldDay.enabledDay"], null);
    assert.equal(change.$set["fieldDay.teams"][0].lastDay, 1);
    assert.equal(change.$push["fieldDay.history"].action, "close");
});

test("Mobile teams are excluded after Day 3 but Fixed teams remain eligible", async t => {
    stubManagement(t, {});
    t.mock.method(Team, "find", () => chain([{ _id: id(), teamType: "Mobile" }, { _id: teamId, teamType: "Fixed" }]));
    const roster = await getDayRoster({ _id: areaId, campaign: campaignId, aic: aicId }, 4);
    assert.deepEqual(roster.rows.map(r => r.teamType), ["Fixed"]);
});

test("closing one team migrates legacy state without closing other teams", async t => {
    const otherTeam = id();
    const update = stubManagement(t, { enabledDay: 1, lastDay: 1, revision: 1 });
    t.mock.method(Team, "find", () => chain([{ _id: teamId, teamNo: "01", teamType: "Fixed" }, { _id: otherTeam, teamNo: "02", teamType: "Fixed" }]));
    await changeFieldDay(String(areaId), aic, { action: "close", day: 1, revision: 1, teamIds: [String(teamId)] });
    const states = update.mock.calls[1].arguments[1].$set["fieldDay.teams"];
    assert.equal(states.find(s => String(s.team) === String(teamId)).enabledDay, null);
    assert.equal(states.find(s => String(s.team) === String(otherTeam)).enabledDay, 1);
});

test("teams can be on different enabled days and guards check the requesting team", async t => {
    const otherTeam = id();
    const state = { teamControlVersion: 1, teams: [{ team: teamId, enabledDay: 1, lastDay: 1 }, { team: otherTeam, enabledDay: 2, lastDay: 2 }] };
    t.mock.method(Area, "findOneAndUpdate", async () => ({ fieldDay: state }));
    await assert.doesNotReject(assertEnabledFieldDay({ assignment, campaignDay: 1, actor, session: {}, write: true }));
    await assert.rejects(assertEnabledFieldDay({ assignment, campaignDay: 2, actor, session: {}, write: true }), e => e.statusCode === 409);
    await assert.doesNotReject(assertEnabledFieldDay({ assignment, campaignDay: 2, actor: { ...actor, _id: otherTeam }, session: {}, write: true }));
});

test("a bulk selection with an unowned or ineligible team fails without changing any team", async t => {
    const update = stubManagement(t, {});
    await assert.rejects(changeFieldDay(String(areaId), aic, { action: "enable", day: 1, revision: 0, teamIds: [String(teamId), String(id())] }), e => e.statusCode === 403);
    assert.equal(update.mock.callCount(), 0);
});

test("bulk close rejects an unfinished selected team without closing the completed team", async t => {
    const otherTeam = id(), otherPoint = id();
    const update = stubManagement(t, { enabledDay: 1, lastDay: 1 });
    t.mock.method(Team, "find", () => chain([{ _id: teamId, teamNo: "01", teamType: "Fixed" }, { _id: otherTeam, teamNo: "02", teamType: "Fixed" }]));
    t.mock.method(Point, "find", () => chain([{ ...assignment, pointType: "Fixed" }, { ...assignment, _id: otherPoint, team: otherTeam, pointType: "Fixed" }]));
    t.mock.method(FixedSheet, "find", () => chain([{ team: teamId, point: assignmentId, status: "Finalized" }, { team: otherTeam, point: otherPoint, status: "Draft" }]));
    await assert.rejects(changeFieldDay(String(areaId), aic, { action: "close", day: 1, revision: 0, teamIds: [String(teamId), String(otherTeam)] }), e => e.statusCode === 409);
    assert.equal(update.mock.callCount(), 0);
});

test("bulk enable changes only the selected teams and records their IDs", async t => {
    const otherTeam = id(), thirdTeam = id();
    const update = stubManagement(t, { teamControlVersion: 1, teams: [{ team: thirdTeam, enabledDay: 3, lastDay: 3 }] });
    t.mock.method(Team, "find", () => chain([teamId, otherTeam, thirdTeam].map((team, index) => ({ _id: team, teamNo: String(index + 1), teamType: "Fixed" }))));
    t.mock.method(Point, "find", () => chain([teamId, otherTeam].map(team => ({ ...assignment, _id: id(), team, pointType: "Fixed" }))));
    await changeFieldDay(String(areaId), aic, { action: "enable", day: 1, revision: 0, teamIds: [String(teamId), String(otherTeam)] });
    const change = update.mock.calls[1].arguments[1];
    const states = change.$set["fieldDay.teams"];
    assert.equal(states.find(s => String(s.team) === String(thirdTeam)).enabledDay, 3);
    for (const selected of [teamId, otherTeam]) assert.equal(states.find(s => String(s.team) === String(selected)).enabledDay, 1);
    assert.deepEqual(change.$push["fieldDay.history"].teams, [teamId, otherTeam]);
});

for (const [type, Model, save, finalize] of [
    ["Mobile", TallySheet, saveTallySheetDraft, finalizeTallySheet],
    ["Fixed", FixedSheet, saveFixedSheetDraft, finalizeFixedSheet],
    ["Transit", TransitSheet, saveTransitSheetDraft, finalizeTransitSheet]
]) test(`${type} save and finalize reject a non-enabled day before changing the sheet`, async t => {
    t.mock.method(Team, "findById", () => chain({ _id: teamId, registeredBy: aicId, teamType: type }));
    t.mock.method(type === "Mobile" ? Route : Point, "findOne", () => chain(assignment));
    t.mock.method(Campaign, "findOne", () => chain({ _id: campaignId, status: "Active" }));
    t.mock.method(Area, "findOneAndUpdate", async () => null);
    t.mock.method(Model, "findOne", () => chain({ ...assignment, route: assignmentId, point: assignmentId, status: "Draft" }));
    const create = t.mock.method(Model, "create", async () => { throw Error("must not create"); });
    const session = {};
    const payload = { campaignId, routeId: assignmentId };
    await assert.rejects(type === "Mobile" ? save(teamId, 1, actor, payload, session) : save(teamId, 1, assignmentId, actor, payload, session), e => e.statusCode === 409);
    await assert.rejects(finalize(teamId, 1, actor, campaignId, assignmentId, session), e => e.statusCode === 409);
    assert.equal(create.mock.callCount(), 0);
});
