import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { saveFixedSheetDraft, getFixedSheetData, finalizeFixedSheet } from "./fixedSheet.service.js";
import { ApiError } from "../../utils/ApiError.js";
import { reopenFieldSheet } from "../reopening/reopening.service.js";
import { FixedSheet } from "./fixedSheet.model.js";

export const saveDraft = asyncHandler(async (req, res) => {
    const { teamId, day } = req.params;
    const { pointId, ...payload } = req.body; // Fixed Teams must specify which point they are at

    if (!pointId) throw new ApiError(400, "Point ID is required to generate a Fixed Sheet");

    const fixedSheet = await saveFixedSheetDraft(teamId, Number(day), pointId, req.user, payload);
    
    return res.status(200).json(new ApiResponse(200, fixedSheet, "Fixed Sheet draft saved successfully"));
});

export const getFixedSheet = asyncHandler(async (req, res) => {
    const { teamId, day } = req.params;
    const { pointId } = req.query;
    const fixedSheet = await getFixedSheetData(teamId, Number(day), pointId, req.user, req.query.campaignId);
    
    return res.status(200).json(new ApiResponse(200, fixedSheet || {}, "Fixed Sheet retrieved successfully"));
});

export const finalize = asyncHandler(async (req, res) => {
    const { teamId, day } = req.params;
    const fixedSheet = await finalizeFixedSheet(teamId, Number(day), req.user, req.body?.campaignId, req.body?.pointId);
    
    return res.status(200).json(new ApiResponse(200, fixedSheet, "Fixed Sheet validated, finalized, and locked"));
});

export const reopen = asyncHandler(async (req, res) => {
    const { teamId, day } = req.params;
    const fixedSheet = await reopenFieldSheet({
        Model: FixedSheet,
        label: "Fixed Sheet",
        teamId,
        campaignDay: Number(day),
        aicId: req.user._id,
        reason: req.body?.reason
    });

    return res.status(200).json(new ApiResponse(200, fixedSheet, "Fixed Sheet reopened to Draft status."));
});
