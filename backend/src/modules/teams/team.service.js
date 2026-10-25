import { Team } from "./team.model.js";
import { Campaign } from "../campaigns/campaign.model.js";
import { ApiError } from "../../utils/ApiError.js";

export const createTeam = async (payload, aicId) => {
    const existingTeam = await Team.findOne({ username: payload.username });
    if (existingTeam) {
        throw new ApiError(409, "Team with this Username/CNIC already exists");
    }

    return await Team.create({ ...payload, registeredBy: aicId });
};

export const getAicTeams = async (aicId) => {
    return await Team.find({ registeredBy: aicId }).select("-password -refreshToken");
};

export const assignTeam = async (campaignId, teamId, aicId) => {
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) throw new ApiError(404, "Campaign not found");
    if (campaign.status === "Completed") throw new ApiError(403, "Cannot modify a completed campaign[cite: 1]");
    
    // Ensure the AIC is authorized for this campaign[cite: 1]
    if (!campaign.aics.includes(aicId)) {
        throw new ApiError(403, "You are not assigned to this campaign");
    }

    const team = await Team.findOne({ _id: teamId, registeredBy: aicId });
    if (!team) throw new ApiError(404, "Team not found or unauthorized");

    if (campaign.teams.includes(teamId)) {
        throw new ApiError(409, "Team is already assigned to this campaign");
    }

    // Optional: Enforce team capacity rules (max 6 mobile, 3 fixed, 3 transit) here[cite: 1]

    campaign.teams.push(teamId);
    await campaign.save();
    return team;
};