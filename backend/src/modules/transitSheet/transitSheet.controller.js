import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { saveTransitSheetDraft, getTransitSheetData, finalizeTransitSheet } from "./transitSheet.service.js";
import { ApiError } from "../../utils/ApiError.js";
import { reopenFieldSheet } from "../reopening/reopening.service.js";
import { TransitSheet } from "./transitSheet.model.js";

export const saveDraft = asyncHandler(async (req, res) => {
    const { teamId, day } = req.params;
    const { pointId, ...payload } = req.body; 

    // Transit Teams must specify which transit point they are stationed at
    if (!pointId) {
        throw new ApiError(400, "Transit Point ID is required to generate a Transit Sheet");
    }

    const transitSheet = await saveTransitSheetDraft(teamId, Number(day), pointId, req.user, payload);
    
    return res.status(200).json(
        new ApiResponse(200, transitSheet, "Transit Sheet draft saved successfully")
    );
});

export const getTransitSheet = asyncHandler(async (req, res) => {
    const { teamId, day } = req.params;
    const { pointId } = req.query;
    
    const transitSheet = await getTransitSheetData(teamId, Number(day), pointId, req.user, req.query.campaignId);
    
    return res.status(200).json(
        new ApiResponse(200, transitSheet || {}, "Transit Sheet retrieved successfully")
    );
});

export const finalize = asyncHandler(async (req, res) => {
    const { teamId, day } = req.params;
    
    const transitSheet = await finalizeTransitSheet(teamId, Number(day), req.user, req.body?.campaignId, req.body?.pointId);
    
    return res.status(200).json(
        new ApiResponse(200, transitSheet, "Transit Sheet validated, finalized, and locked")
    );
});

export const reopen = asyncHandler(async (req, res) => {
    const { teamId, day } = req.params;
    const transitSheet = await reopenFieldSheet({
        Model: TransitSheet,
        label: "Transit Sheet",
        teamId,
        campaignDay: Number(day),
        aicId: req.user._id,
        reason: req.body?.reason
    });

    return res.status(200).json(new ApiResponse(200, transitSheet, "Transit Sheet reopened to Draft status."));
});
