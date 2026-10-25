import { UCMP } from "./ucmp.model.js";
import { Campaign } from "../campaigns/campaign.model.js";
import { UCI } from "../users/uci.model.js";
import { ApiError } from "../../utils/ApiError.js";

export const getUCMPData = async (campaignId, uciId) => {
    return await UCMP.findOne({ campaign: campaignId, uci: uciId });
};

export const saveUCMPDraft = async (campaignId, uciId, payload) => {
    const campaign = await Campaign.findOne({ _id: campaignId, uci: uciId });
    if (!campaign) throw new ApiError(404, "Campaign not found or unauthorized");
    
    // Locked campaign records must be read-only[cite: 1]
    if (campaign.status !== "Planning") throw new ApiError(403, "UCMP can only be modified during the Planning phase");

    let ucmp = await UCMP.findOne({ campaign: campaignId });

    if (ucmp && ucmp.status === "Finalized") {
        throw new ApiError(403, "UCMP is already finalized and locked[cite: 1]");
    }

    const uci = await UCI.findById(uciId);

    // Auto-population snapshot details
    const autoPopulatedFields = {
        sia: campaign.nameOfSIA,
        campaignName: campaign.campaignName,
        district: uci.district,
        tehsil: uci.townTehsil,
        ucName: uci.ucName,
        uciChargeName: uci.uciName,
        uciPhoneNo: uci.phoneNumber,
    };

    // Calculate Section 6 Total (b+c+d+e+f+g) server-side[cite: 1]
    const b = Number(payload.totalUnder1Year) || 0;
    const c = Number(payload.totalBelow5Years) || 0;
    const d = Number(payload.totalHHChildren) || 0;
    const e = Number(payload.totalSchoolMadrasaChildren) || 0;
    const f = Number(payload.expectedFixedPointChildren) || 0;
    const g = Number(payload.expectedTransitPointChildren) || 0;
    const totalChildren = b + c + d + e + f + g;

    const dataToSave = {
        ...payload,
        ...autoPopulatedFields,
        totalChildren,
        campaign: campaignId,
        uci: uciId,
        status: "Draft" // Ensure it remains a draft via this method[cite: 1]
    };

    if (ucmp) {
        ucmp = await UCMP.findByIdAndUpdate(ucmp._id, dataToSave, { new: true });
    } else {
        ucmp = await UCMP.create(dataToSave);
    }

    return ucmp;
};

export const finalizeUCMP = async (campaignId, uciId) => {
    const ucmp = await UCMP.findOne({ campaign: campaignId, uci: uciId });
    if (!ucmp) throw new ApiError(404, "UCMP draft not found. Please save a draft first.");

    if (ucmp.status === "Finalized") {
        throw new ApiError(400, "UCMP is already finalized");
    }

    // Backend validation for finalization rules to ensure no empty critical fields[cite: 1]
    const requiredFields = [
        "ucSecretary", "vaccinatorName", "totalAICs", "currentCampaignTotalHH", "totalMobileTeams"
    ]; // Can be expanded based on strict business rules

    for (const field of requiredFields) {
        if (ucmp[field] === undefined || ucmp[field] === null || ucmp[field] === "") {
            throw new ApiError(400, `Cannot finalize: ${field} is missing`);
        }
    }

    ucmp.status = "Finalized";
    await ucmp.save();

    return ucmp;
};