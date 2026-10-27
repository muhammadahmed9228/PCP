import assert from "node:assert/strict";
import { test } from "node:test";
import mongoose from "mongoose";
import { Area } from "../src/modules/areas/area.model.js";
import { Campaign } from "../src/modules/campaigns/campaign.model.js";
import { AMP } from "../src/modules/amp/amp.model.js";
import { UCI } from "../src/modules/users/uci.model.js";
import { AIC } from "../src/modules/users/aic.model.js";
import { finalizeAMP, getAMPData, reviewAMP, saveAMPDraft } from "../src/modules/amp/amp.service.js";

const uciId = new mongoose.Types.ObjectId();
const aicId = new mongoose.Types.ObjectId();
const areaId = new mongoose.Types.ObjectId();
const campaignId = new mongoose.Types.ObjectId();

const setupArea = t => {
    t.mock.method(Area, "findOne", async () => ({ _id: areaId, aic: aicId, uci: uciId, campaign: campaignId, areaNo: "01", areaName: "Test" }));
    t.mock.method(Campaign, "findOne", async () => ({ _id: campaignId, uci: uciId, aics: [aicId], status: "Planning", nameOfSIA: "SIA", campaignName: "Campaign" }));
};

test("UCI cannot review another UCI's area", async t => {
    t.mock.method(Area, "findOne", async () => null);
    await assert.rejects(reviewAMP(areaId, uciId, "Approved"), error => error.statusCode === 404);
});

test("reopening requires a meaningful reason before any update", async t => {
    setupArea(t);
    const update = t.mock.method(AMP, "findOneAndUpdate", async () => { throw new Error("should not update"); });
    await assert.rejects(reviewAMP(areaId, uciId, "Reopened", "  "), error => error.statusCode === 400);
    assert.equal(update.mock.callCount(), 0);
});

test("reopen atomically records the actor, reason, count and expected version", async t => {
    setupArea(t);
    t.mock.method(AMP, "findOne", async () => ({ _id: new mongoose.Types.ObjectId(), aic: aicId, status: "Finalized", __v: 3 }));
    const update = t.mock.method(AMP, "findOneAndUpdate", async () => ({ status: "Reopened", reopenCount: 2 }));
    const result = await reviewAMP(areaId, uciId, "Reopened", "  Wrong total  ");
    assert.equal(result.status, "Reopened");
    const [filter, change] = update.mock.calls[0].arguments;
    assert.equal(filter.status, "Finalized");
    assert.equal(filter.__v, 3);
    assert.equal(String(filter.uci), String(uciId));
    assert.equal(change.$set.status, "Reopened");
    assert.equal(change.$inc.reopenCount, 1);
    assert.equal(change.$push.reviewHistory.reason, "Wrong total");
    assert.equal(String(change.$push.reviewHistory.reviewer), String(uciId));
});

test("approval cannot be repeated or applied to an unsubmitted draft", async t => {
    setupArea(t);
    t.mock.method(AMP, "findOne", async () => ({ aic: aicId, status: "Draft" }));
    await assert.rejects(reviewAMP(areaId, uciId, "Approved"), error => error.statusCode === 409);
});

test("approval records the reviewer and rejects a competing review", async t => {
    setupArea(t);
    t.mock.method(AMP, "findOne", async () => ({ _id: new mongoose.Types.ObjectId(), aic: aicId, status: "Finalized", __v: 2 }));
    const update = t.mock.method(AMP, "findOneAndUpdate", async () => null);
    await assert.rejects(reviewAMP(areaId, uciId, "Approved"), error => error.statusCode === 409);
    const [filter, change] = update.mock.calls[0].arguments;
    assert.equal(filter.status, "Finalized");
    assert.equal(filter.__v, 2);
    assert.equal(change.$set.status, "Approved");
    assert.equal(String(change.$set.approvedBy), String(uciId));
    assert.equal(change.$push.reviewHistory.action, "Approved");
});

test("reopened AMP can be resubmitted without removing its audit history", async t => {
    setupArea(t);
    t.mock.method(AMP, "findOne", async () => ({
        _id: new mongoose.Types.ObjectId(), aic: aicId, status: "Reopened", __v: 5,
        vaccinatorName: "Vaccinator", currentCampaignTotalHH: 10, totalMobileTeams: 2
    }));
    const update = t.mock.method(AMP, "findOneAndUpdate", async () => ({ status: "Finalized" }));
    await finalizeAMP(areaId, aicId);
    const [filter, change] = update.mock.calls[0].arguments;
    assert.equal(filter.status, "Reopened");
    assert.equal(filter.__v, 5);
    assert.equal(change.$set.status, "Finalized");
    assert.ok(!Object.hasOwn(change, "$unset"));
    assert.ok(!Object.hasOwn(change.$set, "reviewHistory"));
});

test("AIC cannot read an unassigned area's AMP", async t => {
    t.mock.method(Area, "findOne", async () => null);
    await assert.rejects(getAMPData(areaId, aicId), error => error.statusCode === 404);
});

test("AIC save preserves Reopened and cannot overwrite review metadata", async t => {
    setupArea(t);
    t.mock.method(UCI, "findById", async () => ({ _id: uciId, uciName: "UCI" }));
    t.mock.method(AIC, "findById", async () => ({ _id: aicId, aicName: "AIC" }));
    t.mock.method(AMP, "findOne", async () => ({
        _id: new mongoose.Types.ObjectId(), aic: aicId, status: "Reopened", __v: 4,
        totalHHChildren: 2, toObject: () => ({ totalHHChildren: 2 })
    }));
    const update = t.mock.method(AMP, "findOneAndUpdate", async () => ({ status: "Reopened" }));
    await saveAMPDraft(areaId, aicId, { totalHHChildren: 3, status: "Approved", reopenCount: 0, reviewHistory: [] });
    const [filter, change] = update.mock.calls[0].arguments;
    assert.equal(filter.status, "Reopened");
    assert.equal(filter.__v, 4);
    assert.equal(change.$set.totalChildren, 3);
    assert.ok(!Object.hasOwn(change.$set, "status"));
    assert.ok(!Object.hasOwn(change.$set, "reopenCount"));
    assert.ok(!Object.hasOwn(change.$set, "reviewHistory"));
});
