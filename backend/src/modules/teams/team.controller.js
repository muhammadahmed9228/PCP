import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { createTeam, getAicTeams, assignTeam } from "./team.service.js";

export const registerTeam = asyncHandler(async (req, res) => {
    const team = await createTeam(req.body, req.user._id);
    const createdTeam = await team.constructor.findById(team._id).select("-password -refreshToken");
    return res.status(201).json(new ApiResponse(201, createdTeam, "Team registered successfully"));
});

export const getTeams = asyncHandler(async (req, res) => {
    const teams = await getAicTeams(req.user._id);
    return res.status(200).json(new ApiResponse(200, teams, "Teams retrieved successfully"));
});

export const assignToCampaign = asyncHandler(async (req, res) => {
    const { campaignId, teamId } = req.body;
    await assignTeam(campaignId, teamId, req.user._id);
    return res.status(200).json(new ApiResponse(200, {}, "Team assigned to campaign successfully"));
});