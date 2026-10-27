import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { saveTallySheetDraft, getTallySheetData, finalizeTallySheet } from "./tallySheet.service.js";
import { reopenFieldSheet } from "../reopening/reopening.service.js";
import { TallySheet } from "./tallySheet.model.js";

export const saveDraft = asyncHandler(async (req, res) => {
    const { teamId, day } = req.params;
    
    const tallySheet = await saveTallySheetDraft(teamId, Number(day), req.user, req.body);
    
    return res.status(200).json(
        new ApiResponse(200, tallySheet, "Tally Sheet draft saved successfully")
    );
});

export const getTallySheet = asyncHandler(async (req, res) => {
    const { teamId, day } = req.params;
    const { routeId, campaignId } = req.query;
    
    const tallySheet = await getTallySheetData(teamId, Number(day), req.user, routeId, campaignId);
    
    return res.status(200).json(
        new ApiResponse(200, tallySheet || {}, "Tally Sheet retrieved successfully")
    );
});

export const finalize = asyncHandler(async (req, res) => {
    const { teamId, day } = req.params;
    const { routeId, campaignId } = req.body || {};
    
    const tallySheet = await finalizeTallySheet(teamId, Number(day), req.user, campaignId, routeId);
    
    return res.status(200).json(
        new ApiResponse(200, tallySheet, "Tally Sheet mathematically validated, finalized, and locked")
    );
});

export const reopen = asyncHandler(async (req, res) => {
    const { teamId, day } = req.params;
    const tallySheet = await reopenFieldSheet({
        Model: TallySheet,
        label: "Tally Sheet",
        teamId,
        campaignDay: Number(day),
        aicId: req.user._id,
        reason: req.body?.reason
    });

    return res.status(200).json(
        new ApiResponse(200, tallySheet, "Tally Sheet reopened to Draft status.")
    );
});
