import { Area } from "../areas/area.model.js";
import { Campaign } from "../campaigns/campaign.model.js";
import { Point, Route } from "../geography/geography.model.js";
import { TallySheet } from "../tallySheet/tallySheet.model.js";
import { FixedSheet } from "../fixedSheet/fixedSheet.model.js";
import { TransitSheet } from "../transitSheet/transitSheet.model.js";
import { Form2A } from "../form2a/form2a.model.js";
import { Form2B } from "../form2b/form2b.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { CAMPAIGN_DAYS, isMobileCampaignDay } from "../shared/campaignDays.js";
import { withMongoTransaction } from "../../utils/mongoTransaction.js";

const toId = (value) => value?.toString();

const getExpectedAssignments = async (campaignId, areaId, day, session = null) => {
    const routeQuery = isMobileCampaignDay(day)
        ? Route.find({ campaign: campaignId, area: areaId, campaignDay: day, team: { $ne: null } }).select("team")
        : null;
    const pointQuery = Point.find({ campaign: campaignId, area: areaId, campaignDay: day, team: { $ne: null } }).select("team pointType");
    if (session) {
        routeQuery?.session(session);
        pointQuery.session(session);
    }
    const [routes, points] = await Promise.all([
        routeQuery ? routeQuery : [],
        pointQuery
    ]);

    const assignments = { mobile: new Set(), fixed: new Set(), transit: new Set() };
    routes.forEach((route) => assignments.mobile.add(toId(route.team)));
    points.forEach((point) => assignments[point.pointType.toLowerCase()].add(toId(point.team)));
    return assignments;
};

export const getAreaSheetReadiness = async (campaignId, areaId, day, session = null) => {
    const assignments = await getExpectedAssignments(campaignId, areaId, day, session);
    const missing = [];

    const models = [
        ["Mobile", assignments.mobile, TallySheet],
        ["Fixed", assignments.fixed, FixedSheet],
        ["Transit", assignments.transit, TransitSheet]
    ];

    for (const [teamType, teamIds, Model] of models) {
        for (const teamId of teamIds) {
            const query = Model.findOne({ campaign: campaignId, area: areaId, team: teamId, campaignDay: day });
            if (session) query.session(session);
            const sheet = await query.select("status");
            if (!sheet) missing.push(`${teamType} team ${teamId}: sheet not started`);
            else if (sheet.status !== "Finalized") missing.push(`${teamType} team ${teamId}: sheet is ${sheet.status}`);
        }
    }

    return { isReady: missing.length === 0, missing, assignments };
};

export const assertForm2AReadyToFinalize = async (form2A, session = null) => {
    const readiness = await getAreaSheetReadiness(form2A.campaign, form2A.area, form2A.campaignDay, session);
    if (!readiness.isReady) {
        throw new ApiError(400, "Form 2A cannot be finalized until every assigned team sheet is finalized.", readiness.missing);
    }
    return readiness;
};

export const assertForm2BReadyToFinalize = async (form2B, session = null) => {
    const areasQuery = Area.find({ campaign: form2B.campaign }).select("_id areaName areaNo");
    if (session) areasQuery.session(session);
    const areas = await areasQuery;
    const missing = [];

    for (const area of areas) {
        const query = Form2A.findOne({ campaign: form2B.campaign, area: area._id, campaignDay: form2B.campaignDay });
        if (session) query.session(session);
        const form2A = await query.select("status");
        if (!form2A) missing.push(`Area ${area.areaNo || area._id}: Form 2A not started`);
        else if (form2A.status !== "Finalized") missing.push(`Area ${area.areaNo || area._id}: Form 2A is ${form2A.status}`);
    }

    if (missing.length) {
        throw new ApiError(400, "Form 2B cannot be finalized until every campaign area has a finalized Form 2A.", missing);
    }
    return { isReady: true, missing: [] };
};

export const getCampaignCompletionReadiness = async (campaignId, uciId, session = null) => {
    const campaignQuery = Campaign.findOne({ _id: campaignId, uci: uciId });
    if (session) campaignQuery.session(session);
    const campaign = await campaignQuery;
    if (!campaign) throw new ApiError(404, "Campaign not found or unauthorized.");

    const areasQuery = Area.find({ campaign: campaignId }).select("_id");
    if (session) areasQuery.session(session);
    const areas = await areasQuery;
    const requiredDays = [];
    const missing = [];
    for (const day of CAMPAIGN_DAYS) {
        let hasAssignment = false;
        for (const area of areas) {
            const assignments = await getExpectedAssignments(campaignId, area._id, day, session);
            if (assignments.mobile.size || assignments.fixed.size || assignments.transit.size) {
                hasAssignment = true;
                break;
            }
        }
        if (!hasAssignment) continue;

        requiredDays.push(day);
        const form2BQuery = Form2B.findOne({ campaign: campaignId, uci: uciId, campaignDay: day });
        if (session) form2BQuery.session(session);
        const form2B = await form2BQuery.select("status");
        if (!form2B) missing.push(`Day ${day}: Form 2B not started`);
        else if (form2B.status !== "Finalized") missing.push(`Day ${day}: Form 2B is ${form2B.status}`);
    }

    return { isReady: missing.length === 0 && requiredDays.length > 0, requiredDays, missing };
};

export const completeCampaign = async (campaignId, uciId) => withMongoTransaction(async (session) => {
    const campaignQuery = Campaign.findOne({ _id: campaignId, uci: uciId });
    campaignQuery.session(session);
    const campaign = await campaignQuery;
    if (!campaign) throw new ApiError(404, "Campaign not found or unauthorized.");
    if (campaign.status === "Completed") throw new ApiError(400, "Campaign is already completed.");
    if (campaign.status !== "Active") throw new ApiError(400, "Only an Active campaign can be completed.");

    const readiness = await getCampaignCompletionReadiness(campaignId, uciId, session);
    if (!readiness.isReady) {
        throw new ApiError(400, "Campaign cannot be completed until all required daily Form 2B records are finalized.", readiness.missing);
    }

    campaign.status = "Completed";
    campaign.completedAt = new Date();
    await campaign.save({ session });
    return campaign;
});
