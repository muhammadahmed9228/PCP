import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { saveAMPDraft, finalizeAMP, getAMPData } from "./amp.service.js";

export const saveDraft = asyncHandler(async (req, res) => {
    const { areaId } = req.params;
    const amp = await saveAMPDraft(areaId, req.user._id, req.body);
    return res.status(200).json(new ApiResponse(200, amp, "AMP draft saved successfully"));
});

export const finalize = asyncHandler(async (req, res) => {
    const { areaId } = req.params;
    const amp = await finalizeAMP(areaId, req.user._id);
    return res.status(200).json(new ApiResponse(200, amp, "AMP finalized and locked successfully"));
});

export const getAMP = asyncHandler(async (req, res) => {
    const { areaId } = req.params;
    const amp = await getAMPData(areaId, req.user._id);
    return res.status(200).json(new ApiResponse(200, amp || {}, "AMP retrieved successfully"));
});