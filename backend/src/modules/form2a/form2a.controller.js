import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { generateOrUpdateForm2ADraft, finalizeForm2A } from "./form2a.service.js";
import { ApiError } from "../../utils/ApiError.js";
import { reopenForm2A } from "../reopening/reopening.service.js";

export const generateDraft = asyncHandler(async (req, res) => {
    const { areaId, day } = req.params;
    
    // Automatically runs calculations by scraping DB for finalized field sheets
    const form2A = await generateOrUpdateForm2ADraft(areaId, Number(day), req.user._id);
    
    return res.status(200).json(
        new ApiResponse(200, form2A, "Form 2A aggregated and updated successfully.")
    );
});

export const finalize = asyncHandler(async (req, res) => {
    const { areaId, day } = req.params;
    
    const form2A = await finalizeForm2A(areaId, Number(day), req.user._id);
    
    return res.status(200).json(
        new ApiResponse(200, form2A, "Form 2A finalized and securely locked.")
    );
});

export const reopen = asyncHandler(async (req, res) => {
    const { areaId, day } = req.params;
    const form2A = await reopenForm2A({
        areaId,
        campaignDay: Number(day),
        uciId: req.user._id,
        reason: req.body?.reason
    });

    return res.status(200).json(
        new ApiResponse(200, form2A, "Form 2A reopened to Draft status.")
    );
});
