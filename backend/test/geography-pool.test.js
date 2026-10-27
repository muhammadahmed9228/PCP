import assert from "node:assert/strict";
import { test } from "node:test";
import mongoose from "mongoose";
import { Area } from "../src/modules/areas/area.model.js";
import { Campaign } from "../src/modules/campaigns/campaign.model.js";
import { Route, Point } from "../src/modules/geography/geography.model.js";
import { Team } from "../src/modules/teams/team.model.js";
import { assignGeographyService, listGeographyForAreaService, unassignGeographyService } from "../src/modules/geography/geography.service.js";

const aicId = new mongoose.Types.ObjectId();
const areaId = new mongoose.Types.ObjectId();
const campaignId = new mongoose.Types.ObjectId();
const teamId = new mongoose.Types.ObjectId();
const routeId = new mongoose.Types.ObjectId();
const pointId = new mongoose.Types.ObjectId();

const planning = t => {
    t.mock.method(Area, "findById", async () => ({ _id: areaId, aic: aicId, campaign: campaignId }));
    t.mock.method(Campaign, "findById", async () => ({ _id: campaignId, status: "Planning" }));
};

test("listing is scoped to the AIC's area and returns a paginated count", async t => {
    const areaLookup = t.mock.method(Area, "findOne", async () => ({ _id: areaId, campaign: campaignId }));
    let filter;
    let sort;
    let skip;
    let limit;
    t.mock.method(Route, "find", conditions => {
        filter = conditions;
        const chain = {
            populate: () => chain,
            sort: value => { sort = value; return chain; },
            skip: value => { skip = value; return chain; },
            limit: async value => { limit = value; return [{ _id: routeId }]; }
        };
        return chain;
    });
    const count = t.mock.method(Route, "countDocuments", async () => 21);
    const result = await listGeographyForAreaService(areaId, aicId, "routes", {
        page: "2", limit: "10", filter: "available", search: "Main.*", day: "1", sort: "routeNo", order: "desc"
    });
    assert.deepEqual(result.items, [{ _id: routeId }]);
    assert.equal(result.total, 21);
    assert.equal(result.page, 2);
    assert.equal(result.limit, 10);
    assert.equal(String(areaLookup.mock.calls[0].arguments[0].aic), String(aicId));
    assert.equal(String(filter.area), String(areaId));
    assert.equal(String(filter.campaign), String(campaignId));
    assert.equal(String(filter.aic), String(aicId));
    assert.equal(filter.team, null);
    assert.equal(filter.campaignDay, 1);
    assert.equal(filter.$or[0].routeName.test("Main.*"), true);
    assert.equal(filter.$or[0].routeName.test("MainXYZ"), false);
    assert.deepEqual(sort, { routeNo: -1, _id: -1 });
    assert.equal(skip, 10);
    assert.equal(limit, 10);
    assert.equal(count.mock.calls[0].arguments[0], filter);
});

test("listing refuses an area outside the signed-in AIC's scope", async t => {
    t.mock.method(Area, "findOne", async () => null);
    const find = t.mock.method(Route, "find", () => { throw new Error("should not list"); });
    await assert.rejects(listGeographyForAreaService(areaId, aicId, "routes"), error => error.statusCode === 404);
    assert.equal(find.mock.callCount(), 0);
});

test("listing rejects invalid sort, pagination, and contradictory filters", async t => {
    t.mock.method(Area, "findOne", async () => ({ _id: areaId, campaign: campaignId }));
    const find = t.mock.method(Point, "find", () => { throw new Error("should not list"); });
    for (const query of [
        { sort: "$where" }, { limit: "101" }, { page: "0" },
        { filter: "available", teamId: String(teamId) }, { pointType: "Mobile" }
    ]) {
        await assert.rejects(listGeographyForAreaService(areaId, aicId, "points", query), error => error.statusCode === 400);
    }
    assert.equal(find.mock.callCount(), 0);
});

test("unassign keeps the route and changes only its assignment", async t => {
    planning(t);
    t.mock.method(Route, "findOne", async () => ({ _id: routeId, area: areaId, team: teamId }));
    const update = t.mock.method(Route, "findOneAndUpdate", async () => ({ _id: routeId, team: null }));
    const result = await unassignGeographyService(Route, routeId, aicId);
    assert.equal(result.team, null);
    const [match, change, options] = update.mock.calls[0].arguments;
    assert.equal(String(match.team), String(teamId));
    assert.equal(String(match.aic), String(aicId));
    assert.deepEqual(change, { $set: { team: null, campaign: campaignId } });
    assert.equal(options.runValidators, true);
});

test("available point can only be assigned to an owned team of its type", async t => {
    planning(t);
    t.mock.method(Point, "findOne", async () => ({ _id: pointId, area: areaId, team: null, pointType: "Fixed" }));
    const teamLookup = t.mock.method(Team, "findOne", () => ({ select: async () => ({ _id: teamId, teamType: "Fixed" }) }));
    const update = t.mock.method(Point, "findOneAndUpdate", async () => ({ populate: async () => ({ _id: pointId, team: teamId }) }));
    const result = await assignGeographyService(Point, pointId, teamId, aicId);
    assert.equal(String(result.team), String(teamId));
    assert.equal(String(teamLookup.mock.calls[0].arguments[0].registeredBy), String(aicId));
    const [match, change] = update.mock.calls[0].arguments;
    assert.equal(match.team, null);
    assert.equal(String(change.$set.team), String(teamId));
});

test("assignment rejects an incompatible team before changing the point", async t => {
    planning(t);
    t.mock.method(Point, "findOne", async () => ({ _id: pointId, area: areaId, team: null, pointType: "Fixed" }));
    t.mock.method(Team, "findOne", () => ({ select: async () => ({ _id: teamId, teamType: "Transit" }) }));
    const update = t.mock.method(Point, "findOneAndUpdate", async () => { throw new Error("should not update"); });
    await assert.rejects(assignGeographyService(Point, pointId, teamId, aicId), error => error.statusCode === 400);
    assert.equal(update.mock.callCount(), 0);
});

test("a competing reassignment returns a conflict", async t => {
    planning(t);
    t.mock.method(Route, "findOne", async () => ({ _id: routeId, area: areaId, team: null }));
    t.mock.method(Team, "findOne", () => ({ select: async () => ({ _id: teamId, teamType: "Mobile" }) }));
    t.mock.method(Route, "findOneAndUpdate", async () => null);
    await assert.rejects(assignGeographyService(Route, routeId, teamId, aicId), error => error.statusCode === 409);
});
