import assert from "node:assert/strict";
import { test } from "node:test";
import mongoose from "mongoose";
import { Area } from "../src/modules/areas/area.model.js";
import { Campaign } from "../src/modules/campaigns/campaign.model.js";
import { AMP } from "../src/modules/amp/amp.model.js";
import { createAreaAndAssign, updateArea } from "../src/modules/areas/area.controller.js";

const uciId = new mongoose.Types.ObjectId();
const aicId = new mongoose.Types.ObjectId();
const otherAicId = new mongoose.Types.ObjectId();
const campaignId = new mongoose.Types.ObjectId();
const areaId = new mongoose.Types.ObjectId();
const secondAreaId = new mongoose.Types.ObjectId();

const invoke = (handler, params = {}, body = {}) => new Promise((resolve, reject) => {
    const req = { user: { _id: uciId }, params, body };
    const res = { status(code) { this.code = code; return this; }, json(payload) { resolve({ code: this.code, payload }); } };
    handler(req, res, reject);
});

const mockCampaign = t => t.mock.method(Campaign, "findOne", async () => ({
    _id: campaignId, uci: uciId, aics: [aicId, otherAicId], status: "Planning"
}));

test("area schema enforces one area per AIC within each campaign", () => {
    const index = Area.schema.indexes().find(([keys]) => keys.campaign === 1 && keys.aic === 1);
    assert.deepEqual(index, [
        { campaign: 1, aic: 1 },
        { unique: true, name: "one_area_per_aic_per_campaign" }
    ]);
});

test("creating a second area for the same AIC in a campaign is rejected", async t => {
    mockCampaign(t);
    t.mock.method(Area, "findOne", async () => null);
    const occupied = t.mock.method(Area, "exists", async () => ({ _id: areaId }));
    const create = t.mock.method(Area, "create", async () => { throw new Error("should not create"); });
    await assert.rejects(invoke(createAreaAndAssign, {}, {
        areaNo: "02", areaName: "Second", campaignId: String(campaignId), aicId: String(aicId)
    }), error => error.statusCode === 409);
    assert.equal(String(occupied.mock.calls[0].arguments[0].campaign), String(campaignId));
    assert.equal(String(occupied.mock.calls[0].arguments[0].aic), String(aicId));
    assert.equal(create.mock.callCount(), 0);
});

test("database duplicate-key race becomes a conflict instead of an internal error", async t => {
    mockCampaign(t);
    t.mock.method(Area, "findOne", async () => null);
    t.mock.method(Area, "exists", async () => null);
    t.mock.method(Area, "create", async () => { throw { code: 11000, keyPattern: { campaign: 1, aic: 1 } }; });
    await assert.rejects(invoke(createAreaAndAssign, {}, {
        areaNo: "02", areaName: "Second", campaignId: String(campaignId), aicId: String(aicId)
    }), error => error.statusCode === 409 && /already assigned/.test(error.message));
});

test("reassigning an area to an AIC who owns another area is rejected", async t => {
    const area = { _id: areaId, campaign: campaignId, aic: aicId, areaNo: "01", save: async () => { throw new Error("should not save"); } };
    t.mock.method(Area, "findOne", async () => area);
    t.mock.method(Campaign, "findById", async () => ({ _id: campaignId, aics: [aicId, otherAicId], status: "Planning" }));
    const occupied = t.mock.method(Area, "exists", async () => ({ _id: secondAreaId }));
    const amp = t.mock.method(AMP, "exists", async () => { throw new Error("should not check AMP"); });
    await assert.rejects(invoke(updateArea, { id: String(areaId) }, { aicId: String(otherAicId) }), error => error.statusCode === 409);
    const match = occupied.mock.calls[0].arguments[0];
    assert.equal(String(match.campaign), String(campaignId));
    assert.equal(String(match.aic), String(otherAicId));
    assert.equal(String(match._id.$ne), String(areaId));
    assert.equal(amp.mock.callCount(), 0);
});

test("editing an area without changing its AIC remains allowed", async t => {
    const area = { _id: areaId, campaign: campaignId, aic: aicId, areaNo: "01", areaName: "Before", save: async () => {} };
    t.mock.method(Area, "findOne", async () => area);
    t.mock.method(Campaign, "findById", async () => ({ _id: campaignId, aics: [aicId], status: "Planning" }));
    const occupied = t.mock.method(Area, "exists", async () => { throw new Error("should not check occupancy"); });
    const amp = t.mock.method(AMP, "exists", async () => { throw new Error("should not check AMP"); });
    t.mock.method(Area, "findById", () => ({ populate: async () => area }));
    const result = await invoke(updateArea, { id: String(areaId) }, { aicId: String(aicId).toUpperCase(), areaName: "After" });
    assert.equal(result.code, 200);
    assert.equal(area.areaName, "After");
    assert.equal(occupied.mock.callCount(), 0);
    assert.equal(amp.mock.callCount(), 0);
});

test("the existing AMP reassignment guard is preserved", async t => {
    const area = { _id: areaId, campaign: campaignId, aic: aicId, areaNo: "01", save: async () => { throw new Error("should not save"); } };
    t.mock.method(Area, "findOne", async () => area);
    t.mock.method(Campaign, "findById", async () => ({ _id: campaignId, aics: [aicId, otherAicId], status: "Planning" }));
    t.mock.method(Area, "exists", async () => null);
    t.mock.method(AMP, "exists", async () => ({ _id: new mongoose.Types.ObjectId() }));
    await assert.rejects(invoke(updateArea, { id: String(areaId) }, { aicId: String(otherAicId) }), error => error.statusCode === 409 && /AMP/.test(error.message));
});

test("invalid AIC IDs are rejected before database queries", async t => {
    const campaign = t.mock.method(Campaign, "findOne", async () => { throw new Error("should not query"); });
    await assert.rejects(invoke(createAreaAndAssign, {}, {
        areaNo: "02", areaName: "Second", campaignId: String(campaignId), aicId: { $ne: null }
    }), error => error.statusCode === 400);
    assert.equal(campaign.mock.callCount(), 0);
});
