import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { saveOMPDraft, finalizeOMP, getOMPData } from "./omp.service.js";
import { ApiError } from "../../utils/ApiError.js";

export const saveDraft = asyncHandler(async (req, res) => {
    const { teamId, day } = req.params;
    const { routeId, ...payload } = req.body; // routeId must be passed from frontend

    if (!routeId) throw new ApiError(400, "Route ID is required to associate the OMP");

    const campaignDay = Number(day);
    if (isNaN(campaignDay)) {
        throw new ApiError(400, "Invalid campaign day parameter");
    }

    const omp = await saveOMPDraft(teamId, campaignDay, routeId, req.user._id, payload);
    return res.status(200).json(new ApiResponse(200, omp, "OMP draft saved successfully"));
});

export const finalize = asyncHandler(async (req, res) => {
    const { teamId, day } = req.params;
    const campaignDay = Number(day);
    if (isNaN(campaignDay)) {
        throw new ApiError(400, "Invalid campaign day parameter");
    }

    const omp = await finalizeOMP(teamId, campaignDay, req.user._id);
    return res.status(200).json(new ApiResponse(200, omp, "OMP finalized successfully"));
});

export const getOMP = asyncHandler(async (req, res) => {
    const { teamId, day } = req.params;
    const { routeId } = req.query;
    const campaignDay = Number(day);
    if (isNaN(campaignDay)) {
        throw new ApiError(400, "Invalid campaign day parameter");
    }

    const omp = await getOMPData(teamId, campaignDay, req.user._id, routeId);
    return res.status(200).json(new ApiResponse(200, omp || {}, "OMP retrieved successfully"));
});