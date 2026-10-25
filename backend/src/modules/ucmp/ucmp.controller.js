import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { saveUCMPDraft, finalizeUCMP, getUCMPData } from "./ucmp.service.js";

export const saveDraft = asyncHandler(async (req, res) => {
    const { campaignId } = req.params;
    const payload = req.body;

    const ucmp = await saveUCMPDraft(campaignId, req.user._id, payload);

    return res.status(200).json(new ApiResponse(200, ucmp, "UCMP draft saved successfully"));
});

export const finalize = asyncHandler(async (req, res) => {
    const { campaignId } = req.params;

    const ucmp = await finalizeUCMP(campaignId, req.user._id);

    return res.status(200).json(new ApiResponse(200, ucmp, "UCMP finalized and locked successfully"));
});

export const getUCMP = asyncHandler(async (req, res) => {
    const { campaignId } = req.params;

    const ucmp = await getUCMPData(campaignId, req.user._id);

    return res.status(200).json(new ApiResponse(200, ucmp || {}, "UCMP retrieved successfully"));
});