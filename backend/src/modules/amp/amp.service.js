import mongoose from "mongoose";
import { AMP } from "./amp.model.js";
import { Area } from "../areas/area.model.js";
import { Campaign } from "../campaigns/campaign.model.js";
import { UCI } from "../users/uci.model.js";
import { AIC } from "../users/aic.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { validateReopenReason } from "../../utils/reopenReason.js";

const editableFields = [
    "vaccinatorName", "currentCampaignTotalHH", "totalBelow5Years", "totalHHChildren",
    "totalSchoolMadrasaChildren", "expectedFixedPointChildren", "expectedTransitPointChildren",
    "totalMobileTeams", "totalFixedTeams", "totalTransitTeams", "teamsRequiringSpecialAttention",
    "vaccineCarrierRequired", "vaccineCarrierAvailable", "vitaminARed", "vitaminABlue",
    "totalVaccineDoses", "totalTallysheets", "totalChalkBoxes", "markers", "plasticBags",
    "pens", "totalBadgeCards", "mobileGovtPerson", "mobileFemaleMember", "mobileLocalPerson",
    "bothAdults", "vaccineVial", "dropper", "totalRefusalChildren", "totalMadrasas",
    "totalMosques", "totalHighSchools", "totalSchoolsMadrasasBelow5", "unvaccinatedLastCampaign",
    "unvaccinatedPastTwoCampaigns", "totalUnderDoseChildren", "protectedVaccinationsAfterLast"
];

const requireId = id => {
    if (!mongoose.isValidObjectId(id)) throw new ApiError(400, "Invalid identifier.");
};

const getAssignedArea = async (areaId, aicId) => {
    requireId(areaId);
    const area = await Area.findOne({ _id: areaId, aic: aicId });
    if (!area) throw new ApiError(404, "Area not found or unauthorized.");
    const campaign = await Campaign.findOne({ _id: area.campaign, uci: area.uci });
    if (!campaign || !campaign.aics.some(id => id.equals(aicId))) {
        throw new ApiError(403, "AIC is not assigned to this campaign.");
    }
    return { area, campaign };
};

const getOwnedArea = async (areaId, uciId) => {
    requireId(areaId);
    const area = await Area.findOne({ _id: areaId, uci: uciId });
    if (!area) throw new ApiError(404, "Area not found or unauthorized.");
    const campaign = await Campaign.findOne({ _id: area.campaign, uci: uciId });
    if (!campaign) throw new ApiError(404, "Campaign not found or unauthorized.");
    return { area, campaign };
};

export const getAMPData = async (areaId, aicId) => {
    const { area, campaign } = await getAssignedArea(areaId, aicId);
    const amp = await AMP.findOne({ area: areaId, aic: aicId });
    if (amp) return amp;

    const [uci, aic] = await Promise.all([UCI.findById(area.uci), AIC.findById(aicId)]);
    return {
        sia: campaign.nameOfSIA || "", areaNo: area.areaNo || "", areaName: area.areaName || "",
        uciName: uci?.uciName || "", uciNo: uci?.uciNo || "", campaignName: campaign.campaignName || "",
        district: uci?.district || "", tehsil: uci?.townTehsil || "", ucName: uci?.ucName || "",
        ucNumber: uci?.ucNumber || "", aicName: aic?.aicName || "", aicPhoneNo: aic?.phoneNumber || "",
        isGovtEmployee: aic?.isGovtEmployee ?? false, aicGender: aic?.gender || "",
        status: "Draft", area: area._id, campaign: campaign._id, uci: uci?._id, aic: aicId
    };
};

export const saveAMPDraft = async (areaId, aicId, payload) => {
    const { area, campaign } = await getAssignedArea(areaId, aicId);
    if (campaign.status !== "Planning") throw new ApiError(403, "AMP can only be modified during Planning.");
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) throw new ApiError(400, "Invalid AMP data.");

    const [uci, aic] = await Promise.all([UCI.findById(area.uci), AIC.findById(aicId)]);
    if (!uci || !aic) throw new ApiError(404, "Assigned UCI or AIC not found.");

    const editable = Object.fromEntries(editableFields.filter(key => Object.hasOwn(payload, key)).map(key => [key, payload[key]]));
    const values = { ...editable,
        sia: campaign.nameOfSIA, areaNo: area.areaNo, areaName: area.areaName,
        uciName: uci.uciName, uciNo: uci.uciNo, campaignName: campaign.campaignName,
        district: uci.district, tehsil: uci.townTehsil, ucName: uci.ucName, ucNumber: uci.ucNumber,
        aicName: aic.aicName, aicPhoneNo: aic.phoneNumber, isGovtEmployee: aic.isGovtEmployee,
        aicGender: aic.gender
    };

    const existing = await AMP.findOne({ area: areaId });
    if (existing && !existing.aic.equals(aicId)) throw new ApiError(409, "This area's AMP belongs to another AIC.");
    if (existing && !["Draft", "Reopened"].includes(existing.status)) {
        throw new ApiError(409, "AMP is submitted or approved and cannot be edited.");
    }
    const merged = { ...(existing?.toObject() || {}), ...values };
    values.totalChildren = ["totalHHChildren", "totalSchoolMadrasaChildren", "expectedFixedPointChildren", "expectedTransitPointChildren"]
        .reduce((sum, field) => sum + (Number(merged[field]) || 0), 0);

    if (existing) {
        const updated = await AMP.findOneAndUpdate(
            { _id: existing._id, aic: aicId, status: existing.status, __v: existing.__v },
            { $set: values, $inc: { __v: 1 } },
            { new: true, runValidators: true }
        );
        if (!updated) throw new ApiError(409, "AMP changed. Reload and try again.");
        return updated;
    }

    try {
        return await AMP.create({ ...values, campaign: campaign._id, area: area._id, uci: uci._id, aic: aicId, status: "Draft" });
    } catch (error) {
        if (error.code === 11000) throw new ApiError(409, "AMP was created by another request. Reload and try again.");
        throw error;
    }
};

export const finalizeAMP = async (areaId, aicId) => {
    const { campaign } = await getAssignedArea(areaId, aicId);
    if (campaign.status !== "Planning") throw new ApiError(403, "AMP can only be submitted during Planning.");
    const amp = await AMP.findOne({ area: areaId, aic: aicId });
    if (!amp) throw new ApiError(404, "AMP draft not found. Save a draft first.");
    if (!["Draft", "Reopened"].includes(amp.status)) throw new ApiError(409, "AMP is already submitted or approved.");
    for (const field of ["vaccinatorName", "currentCampaignTotalHH", "totalMobileTeams"]) {
        if (amp[field] === undefined || amp[field] === null || amp[field] === "") {
            throw new ApiError(400, `Cannot submit: ${field} is missing.`);
        }
    }
    const updated = await AMP.findOneAndUpdate(
        { _id: amp._id, aic: aicId, status: amp.status, __v: amp.__v },
        { $set: { status: "Finalized", finalizedAt: new Date() }, $inc: { __v: 1 } },
        { new: true, runValidators: true }
    );
    if (!updated) throw new ApiError(409, "AMP changed. Reload and try again.");
    return updated;
};

export const listAMPReviews = async (campaignId, uciId) => {
    requireId(campaignId);
    const campaign = await Campaign.findOne({ _id: campaignId, uci: uciId });
    if (!campaign) throw new ApiError(404, "Campaign not found or unauthorized.");
    const areas = await Area.find({ campaign: campaignId, uci: uciId }).populate("aic", "aicName aicNo").sort({ areaNo: 1 }).lean();
    const amps = await AMP.find({ campaign: campaignId, area: { $in: areas.map(area => area._id) }, uci: uciId })
        .select("area aic status reopenCount finalizedAt approvedAt updatedAt").lean();
    const byArea = new Map(amps.map(amp => [String(amp.area), amp]));
    return areas.map(area => ({ area: { _id: area._id, areaNo: area.areaNo, areaName: area.areaName },
        aic: area.aic, amp: byArea.get(String(area._id)) || null }));
};

export const getAMPForReview = async (areaId, uciId) => {
    await getOwnedArea(areaId, uciId);
    const amp = await AMP.findOne({ area: areaId, uci: uciId });
    if (!amp) throw new ApiError(404, "AMP not submitted for this area.");
    return amp;
};

export const reviewAMP = async (areaId, uciId, action, reason) => {
    const { area, campaign } = await getOwnedArea(areaId, uciId);
    if (campaign.status !== "Planning") throw new ApiError(403, "AMP review is only available during Planning.");
    const normalizedReason = action === "Reopened" ? validateReopenReason(reason) : null;
    const amp = await AMP.findOne({ area: areaId, uci: uciId });
    if (!amp) throw new ApiError(404, "AMP not found.");
    if (!amp.aic.equals(area.aic)) throw new ApiError(409, "AMP AIC does not match the area's assigned AIC.");
    if (amp.status !== "Finalized") throw new ApiError(409, "Only a submitted AMP can be reviewed.");
    const at = new Date();
    const update = action === "Approved"
        ? { $set: { status: "Approved", approvedAt: at, approvedBy: uciId },
            $push: { reviewHistory: { action, reviewer: uciId, at } }, $inc: { __v: 1 } }
        : { $set: { status: "Reopened" }, $unset: { finalizedAt: 1 },
            $push: { reviewHistory: { action, reason: normalizedReason, reviewer: uciId, at } },
            $inc: { reopenCount: 1, __v: 1 } };
    const updated = await AMP.findOneAndUpdate(
        { _id: amp._id, aic: area.aic, uci: uciId, status: "Finalized", __v: amp.__v },
        update, { new: true, runValidators: true }
    );
    if (!updated) throw new ApiError(409, "AMP changed. Reload and try again.");
    return updated;
};
