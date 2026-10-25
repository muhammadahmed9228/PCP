import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { generateOrUpdateForm2BDraft, finalizeForm2B, reopenForm2B } from "./form2b.service.js";

export const getOrGenerateForm2B = asyncHandler(async (req, res) => {
    const { campaignId, day } = req.params;

    const form2B = await generateOrUpdateForm2BDraft(campaignId, Number(day), req.user._id);

    return res.status(200).json(
        new ApiResponse(200, form2B, "Form 2B UC summary aggregated successfully.")
    );
});

export const finalize = asyncHandler(async (req, res) => {
    const { campaignId, day } = req.params;

    const form2B = await finalizeForm2B(campaignId, Number(day), req.user._id);

    return res.status(200).json(
        new ApiResponse(200, form2B, "Form 2B finalized and locked at UC level.")
    );
});

export const reopen = asyncHandler(async (req, res) => {
    const { campaignId, day } = req.params;
    const { reason } = req.body;

    const form2B = await reopenForm2B(campaignId, Number(day), req.user._id, reason);

    return res.status(200).json(
        new ApiResponse(200, form2B, "Form 2B reopened to Draft status.")
    );
});