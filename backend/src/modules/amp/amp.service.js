import { AMP } from "./amp.model.js";
import { Area } from "../areas/area.model.js";
import { Campaign } from "../campaigns/campaign.model.js";
import { UCI } from "../users/uci.model.js";
import { AIC } from "../users/aic.model.js";
import { ApiError } from "../../utils/ApiError.js";

export const getAMPData = async (areaId, aicId) => {
    let amp = await AMP.findOne({ area: areaId, aic: aicId });
    if (amp) return amp;

    // Auto-populate preview snapshot from Area, Campaign, UCI, AIC
    const area = await Area.findById(areaId);
    if (!area) return null;

    const campaign = await Campaign.findById(area.campaign);
    const uci = await UCI.findById(area.uci);
    const aic = await AIC.findById(aicId);

    return {
        sia: campaign?.nameOfSIA || "",
        areaNo: area.areaNo || "",
        areaName: area.areaName || "",
        uciName: uci?.uciName || "",
        uciNo: uci?.uciNo || "",
        campaignName: campaign?.campaignName || "",
        district: uci?.district || "",
        tehsil: uci?.townTehsil || "",
        ucName: uci?.ucName || "",
        ucNumber: uci?.ucNumber || "",
        aicName: aic?.aicName || "",
        aicPhoneNo: aic?.phoneNumber || "",
        isGovtEmployee: aic?.isGovtEmployee ?? false,
        aicGender: aic?.gender || "",
        status: "Draft",
        area: area._id,
        campaign: campaign?._id,
        uci: uci?._id,
        aic: aicId
    };
};

export const saveAMPDraft = async (areaId, aicId, payload) => {
    const area = await Area.findById(areaId);
    if (!area || area.aic.toString() !== aicId.toString()) {
        throw new ApiError(403, "Area not found or unauthorized");
    }

    const campaign = await Campaign.findById(area.campaign);
    if (campaign.status !== "Planning") {
        throw new ApiError(403, "AMP can only be modified during the Planning phase[cite: 1]");
    }

    let amp = await AMP.findOne({ area: areaId });
    if (amp && amp.status === "Finalized") {
        throw new ApiError(403, "AMP is already finalized and locked[cite: 1]");
    }

    const uci = await UCI.findById(area.uci);
    const aic = await AIC.findById(aicId);

    // Auto-population snapshot details
    const autoPopulatedFields = {
        sia: campaign.nameOfSIA,
        areaNo: area.areaNo,
        areaName: area.areaName,
        uciName: uci.uciName,
        uciNo: uci.uciNo,
        campaignName: campaign.campaignName,
        district: uci.district,
        tehsil: uci.townTehsil,
        ucName: uci.ucName,
        ucNumber: uci.ucNumber,
        aicName: aic.aicName,
        aicPhoneNo: aic.phoneNumber,
        isGovtEmployee: aic.isGovtEmployee,
        aicGender: aic.gender
    };

    // Server-side authoritative calculation for Section 4 Total (c+d+e+f = g)[cite: 1]
    const c = Number(payload.totalHHChildren) || 0;
    const d = Number(payload.totalSchoolMadrasaChildren) || 0;
    const e = Number(payload.expectedFixedPointChildren) || 0;
    const f = Number(payload.expectedTransitPointChildren) || 0;
    const totalChildren = c + d + e + f;

    const dataToSave = {
        ...payload,
        ...autoPopulatedFields,
        totalChildren,
        campaign: campaign._id,
        area: area._id,
        uci: uci._id,
        aic: aicId,
        status: "Draft"
    };

    if (amp) {
        amp = await AMP.findByIdAndUpdate(amp._id, dataToSave, { new: true });
    } else {
        amp = await AMP.create(dataToSave);
    }

    return amp;
};

export const finalizeAMP = async (areaId, aicId) => {
    const amp = await AMP.findOne({ area: areaId, aic: aicId });
    if (!amp) throw new ApiError(404, "AMP draft not found. Please save a draft first.");

    if (amp.status === "Finalized") {
        throw new ApiError(400, "AMP is already finalized");
    }

    // Backend validation check before finalizing[cite: 1]
    const requiredFields = [
        "vaccinatorName", "currentCampaignTotalHH", "totalMobileTeams"
    ]; 

    for (const field of requiredFields) {
        if (amp[field] === undefined || amp[field] === null || amp[field] === "") {
            throw new ApiError(400, `Cannot finalize: ${field} is missing`);
        }
    }

    amp.status = "Finalized";
    await amp.save();

    return amp;
};