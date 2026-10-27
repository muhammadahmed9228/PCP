import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { saveAMPDraft, finalizeAMP, getAMPData, listAMPReviews, getAMPForReview, reviewAMP } from "./amp.service.js";

export const saveDraft = asyncHandler(async (req, res) => {
    const { areaId } = req.params;
    const amp = await saveAMPDraft(areaId, req.user._id, req.body);
    return res.status(200).json(new ApiResponse(200, amp, "AMP draft saved successfully"));
});

export const finalize = asyncHandler(async (req, res) => {
    const { areaId } = req.params;
    const amp = await finalizeAMP(areaId, req.user._id);
    return res.status(200).json(new ApiResponse(200, amp, "AMP submitted for UCI review"));
});

export const getAMP = asyncHandler(async (req, res) => {
    const { areaId } = req.params;
    const amp = await getAMPData(areaId, req.user._id);
    return res.status(200).json(new ApiResponse(200, amp || {}, "AMP retrieved successfully"));
});

export const listReviews = asyncHandler(async (req, res) => {
    const items = await listAMPReviews(req.params.campaignId, req.user._id);
    return res.status(200).json(new ApiResponse(200, items, "AMP review list retrieved successfully"));
});

export const getReview = asyncHandler(async (req, res) => {
    const amp = await getAMPForReview(req.params.areaId, req.user._id);
    return res.status(200).json(new ApiResponse(200, amp, "AMP retrieved for review"));
});

export const approve = asyncHandler(async (req, res) => {
    const amp = await reviewAMP(req.params.areaId, req.user._id, "Approved");
    return res.status(200).json(new ApiResponse(200, amp, "AMP approved"));
});

export const reopen = asyncHandler(async (req, res) => {
    const amp = await reviewAMP(req.params.areaId, req.user._id, "Reopened", req.body?.reason);
    return res.status(200).json(new ApiResponse(200, amp, "AMP reopened for correction"));
});
