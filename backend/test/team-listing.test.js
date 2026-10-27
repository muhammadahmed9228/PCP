import assert from "node:assert/strict";
import { test } from "node:test";
import mongoose from "mongoose";
import { Team } from "../src/modules/teams/team.model.js";
import { getAicTeams } from "../src/modules/teams/team.service.js";

const aicId = new mongoose.Types.ObjectId();

test("paged team listing scopes search, filters, sort, counts and page to the AIC", async t => {
    const capture = {};
    t.mock.method(Team, "find", conditions => {
        capture.conditions = conditions;
        return {
            select(fields) { capture.fields = fields; return this; },
            sort(value) { capture.sort = value; return this; },
            skip(value) { capture.skip = value; return this; },
            limit(value) { capture.limit = value; return Promise.resolve([{ teamNo: "01" }]); }
        };
    });
    t.mock.method(Team, "countDocuments", conditions => {
        assert.equal(conditions, capture.conditions);
        return 23;
    });
    t.mock.method(Team, "aggregate", pipeline => {
        assert.equal(pipeline[0].$match, capture.conditions);
        return [{ _id: "Mobile", count: 18 }, { _id: "Fixed", count: 5 }];
    });

    const result = await getAicTeams(aicId, {
        page: "2", limit: "10", search: "[01]*", teamType: "Mobile",
        leaderRoleType: "LHW", leaderGender: "Female", sort: "leader.name", order: "asc"
    });
    assert.equal(String(capture.conditions.registeredBy), String(aicId));
    assert.equal(capture.conditions.teamType, "Mobile");
    assert.equal(capture.conditions["leader.roleType"], "LHW");
    assert.equal(capture.conditions["leader.gender"], "Female");
    assert.equal(capture.conditions.$or[0].teamNo.test("[01]*"), true);
    assert.equal(capture.conditions.$or[0].teamNo.test("0"), false);
    assert.equal(capture.fields, "-password -refreshToken");
    assert.deepEqual(capture.sort, { "leader.name": 1, _id: 1 });
    assert.equal(capture.skip, 10);
    assert.equal(capture.limit, 10);
    assert.deepEqual(result, {
        items: [{ teamNo: "01" }], total: 23, page: 2, limit: 10,
        typeCounts: { Mobile: 18, Fixed: 5, Transit: 0 }
    });
});

test("team list validates query bounds and allowlisted filters before database access", async t => {
    const find = t.mock.method(Team, "find", () => { throw new Error("Must not query"); });
    for (const query of [
        { page: "0" }, { limit: "101" }, { search: "x".repeat(101) },
        { sort: "$where" }, { order: "sideways" }, { teamType: "Other" },
        { leaderRoleType: "Manager" }, { leaderGender: "Unknown" }
    ]) {
        await assert.rejects(getAicTeams(aicId, query), error => error.statusCode === 400);
    }
    assert.equal(find.mock.callCount(), 0);
});

test("team search alone activates paged mode while plain GET retains an array", async t => {
    let legacy = false;
    t.mock.method(Team, "find", () => ({
        select() {
            if (legacy) return Promise.resolve([{ teamNo: "old" }]);
            return this;
        },
        sort() { return this; }, skip() { return this; }, limit() { return Promise.resolve([]); }
    }));
    t.mock.method(Team, "countDocuments", () => 0);
    t.mock.method(Team, "aggregate", () => []);
    const searched = await getAicTeams(aicId, { search: "test" });
    assert.equal(searched.page, 1);
    assert.equal(searched.total, 0);
    legacy = true;
    assert.deepEqual(await getAicTeams(aicId), [{ teamNo: "old" }]);
});
