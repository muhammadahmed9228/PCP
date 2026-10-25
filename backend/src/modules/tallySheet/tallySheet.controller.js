import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { saveTallySheetDraft, getTallySheetData, finalizeTallySheet } from "./tallySheet.service.js";

export const saveDraft = asyncHandler(async (req, res) => {
    const { teamId, day } = req.params;
    
    const tallySheet = await saveTallySheetDraft(teamId, Number(day), req.user._id, req.body);
    
    return res.status(200).json(
        new ApiResponse(200, tallySheet, "Tally Sheet draft saved successfully")
    );
});

export const getTallySheet = asyncHandler(async (req, res) => {
    const { teamId, day } = req.params;
    
    const tallySheet = await getTallySheetData(teamId, Number(day));
    
    return res.status(200).json(
        new ApiResponse(200, tallySheet || {}, "Tally Sheet retrieved successfully")
    );
});

export const finalize = asyncHandler(async (req, res) => {
    const { teamId, day } = req.params;
    
    const tallySheet = await finalizeTallySheet(teamId, Number(day));
    
    return res.status(200).json(
        new ApiResponse(200, tallySheet, "Tally Sheet mathematically validated, finalized, and locked")
    );
});