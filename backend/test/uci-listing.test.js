import assert from "node:assert/strict";
import { test } from "node:test";
import mongoose from "mongoose";
import { Campaign } from "../src/modules/campaigns/campaign.model.js";
import { AIC } from "../src/modules/users/aic.model.js";
import { Area } from "../src/modules/areas/area.model.js";
import { getAllCampaigns } from "../src/modules/campaigns/campaign.controller.js";
import { getAICsForUCI } from "../src/modules/aics/aic.controller.js";
import { getAreasForCampaign } from "../src/modules/areas/area.controller.js";
import { escapeListSearch, isPagedList, parseListQuery } from "../src/utils/listQuery.js";

const uciId = new mongoose.Types.ObjectId();
const campaignId = new mongoose.Types.ObjectId();

const invoke = (handler, query, params = {}) => new Promise((resolve, reject) => {
    handler({ user: { _id: uciId, role: "UCI" }, query, params }, {
        status() { return this; },
        json(value) { resolve(value.data); }
    }, reject);
});

const queryChain = (items, capture) => ({
    select() { return this; }, populate() { return this; },
    sort(value) { capture.sort = value; return this; },
    skip(value) { capture.skip = value; return this; },
    limit(value) { capture.limit = value; return Promise.resolve(items); }
});

test("list query rejects invalid bounds and sort injection; search is literal", () => {
    for (const query of [{ page: "0" }, { page: "1.5" }, { limit: "101" }, { sort: "$where" }, { search: "x".repeat(101) }, { order: "sideways" }]) {
        assert.throws(() => parseListQuery(query, ["createdAt"]), error => error.statusCode === 400);
    }
    assert.equal(escapeListSearch("[abc]*"), "\\[abc\\]\\*");
    assert.equal(isPagedList({ search: "sample" }), true);
    assert.equal(isPagedList({}), false);
});

test("campaign listing scopes search, status, count and stable page sort to UCI", async t => {
    const capture = {};
    t.mock.method(Campaign, "find", conditions => { capture.conditions = conditions; return queryChain([{ campaignName: "One" }], capture); });
    t.mock.method(Campaign, "countDocuments", conditions => { assert.equal(conditions, capture.conditions); return 31; });
    const data = await invoke(getAllCampaigns, { page: "2", limit: "10", search: "[abc]*", status: "Planning", sort: "campaignName", order: "asc" });
    assert.equal(String(capture.conditions.uci), String(uciId));
    assert.equal(capture.conditions.status, "Planning");
    assert.equal(capture.conditions.$or[0].campaignName.test("[abc]*"), true);
    assert.deepEqual(capture.sort, { campaignName: 1, _id: 1 });
    assert.equal(capture.skip, 10);
    assert.equal(capture.limit, 10);
    assert.equal(data.total, 31);
    assert.equal(data.page, 2);
});

test("AIC listing excludes credentials and filters assignments within UCI", async t => {
    const capture = {};
    t.mock.method(Campaign, "distinct", (field, conditions) => { assert.equal(field, "aics"); assert.equal(String(conditions.uci), String(uciId)); return [new mongoose.Types.ObjectId()]; });
    t.mock.method(AIC, "find", conditions => { capture.conditions = conditions; return queryChain([{ aicName: "One" }], capture); });
    t.mock.method(AIC, "countDocuments", () => 1);
    const data = await invoke(getAICsForUCI, { page: "1", assignment: "assigned", employment: "government" });
    assert.equal(String(capture.conditions.registeredBy), String(uciId));
    assert.equal(capture.conditions.isGovtEmployee, true);
    assert.equal(capture.conditions._id.$in.length, 1);
    assert.equal(data.total, 1);
});

test("area listing checks campaign ownership before listing and reports all occupied AICs", async t => {
    t.mock.method(Campaign, "findOne", async conditions => { assert.equal(String(conditions.uci), String(uciId)); return { _id: campaignId }; });
    const capture = {};
    t.mock.method(Area, "find", conditions => { capture.conditions = conditions; return queryChain([{ areaNo: "01" }], capture); });
    t.mock.method(Area, "countDocuments", () => 1);
    t.mock.method(Area, "distinct", (field, scope) => { assert.equal(field, "aic"); assert.equal(scope.campaign, String(campaignId)); return [new mongoose.Types.ObjectId()]; });
    const data = await invoke(getAreasForCampaign, { page: "1", search: "01" }, { campaignId: String(campaignId) });
    assert.equal(String(capture.conditions.uci), String(uciId));
    assert.equal(data.occupiedAicIds.length, 1);
    assert.equal(data.total, 1);
});

test("legacy list requests still return arrays for existing selectors", async t => {
    t.mock.method(Campaign, "find", conditions => {
        assert.equal(String(conditions.uci), String(uciId));
        return { sort: async () => [{ campaignName: "Existing" }] };
    });
    t.mock.method(AIC, "find", conditions => {
        assert.equal(String(conditions.registeredBy), String(uciId));
        return { select: async () => [{ aicName: "Existing" }] };
    });
    t.mock.method(Campaign, "findOne", async () => ({ _id: campaignId }));
    t.mock.method(Area, "find", () => ({ populate: () => ({ sort: async () => [{ areaNo: "01" }] }) }));
    assert.ok(Array.isArray(await invoke(getAllCampaigns, {})));
    assert.ok(Array.isArray(await invoke(getAICsForUCI, {})));
    assert.ok(Array.isArray(await invoke(getAreasForCampaign, {}, { campaignId: String(campaignId) })));
});
