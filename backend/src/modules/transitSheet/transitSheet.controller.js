import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { saveTransitSheetDraft, getTransitSheetData, finalizeTransitSheet } from "./transitSheet.service.js";
import { ApiError } from "../../utils/ApiError.js";

export const saveDraft = asyncHandler(async (req, res) => {
    const { teamId, day } = req.params;
    const { pointId, ...payload } = req.body; 

    // Transit Teams must specify which transit point they are stationed at
    if (!pointId) {
        throw new ApiError(400, "Transit Point ID is required to generate a Transit Sheet");
    }

    const transitSheet = await saveTransitSheetDraft(teamId, Number(day), pointId, req.user._id, payload);
    
    return res.status(200).json(
        new ApiResponse(200, transitSheet, "Transit Sheet draft saved successfully")
    );
});

export const getTransitSheet = asyncHandler(async (req, res) => {
    const { teamId, day } = req.params;
    const { pointId } = req.query;
    
    const transitSheet = await getTransitSheetData(teamId, Number(day), pointId);
    
    return res.status(200).json(
        new ApiResponse(200, transitSheet || {}, "Transit Sheet retrieved successfully")
    );
});

export const finalize = asyncHandler(async (req, res) => {
    const { teamId, day } = req.params;
    
    const transitSheet = await finalizeTransitSheet(teamId, Number(day));
    
    return res.status(200).json(
        new ApiResponse(200, transitSheet, "Transit Sheet validated, finalized, and locked")
    );
});