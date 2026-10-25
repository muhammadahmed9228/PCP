import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { Area } from "../areas/area.model.js";
import { Campaign } from "../campaigns/campaign.model.js";
import { Team } from "../teams/team.model.js";
import { ApiError } from "../../utils/ApiError.js";

export const getOperationalContext = asyncHandler(async (req, res) => {
    const { _id, role } = req.user;

    // 1. If logged in as UCI
    if (role === "UCI") {
        const activeCampaign = await Campaign.findOne({ uci: _id, status: "Active" }) 
            || await Campaign.findOne({ uci: _id }).sort({ createdAt: -1 });
        
        return res.status(200).json(
            new ApiResponse(200, {
                role: "UCI",
                uciId: _id,
                campaign: activeCampaign || null
            }, "UCI context resolved")
        );
    }

    // 2. If logged in as AIC
    if (role === "AIC") {
        const area = await Area.findOne({ aic: _id }).populate("campaign");
        if (!area) {
            throw new ApiError(404, "No Area assigned to this AIC yet.");
        }

        return res.status(200).json(
            new ApiResponse(200, {
                role: "AIC",
                aicId: _id,
                areaId: area._id,
                areaName: area.areaName,
                areaNo: area.areaNo,
                uciId: area.uci,
                campaign: area.campaign
            }, "AIC operational context resolved")
        );
    }

    // 3. If logged in as FieldTeam (Mobile, Fixed, or Transit)
    if (role === "FieldTeam") {
        const team = await Team.findById(_id);
        if (!team) throw new ApiError(404, "Team not found.");

        // Team is registered by an AIC; find that AIC's Area
        const area = await Area.findOne({ aic: team.registeredBy }).populate("campaign");
        if (!area) {
            throw new ApiError(404, "Your AIC has not been assigned an active Area yet.");
        }

        return res.status(200).json(
            new ApiResponse(200, {
                role: "FieldTeam",
                teamId: team._id,
                teamNo: team.teamNo,
                teamType: team.teamType, // "Mobile" | "Fixed" | "Transit"
                aicId: team.registeredBy,
                areaId: area._id,
                areaName: area.areaName,
                areaNo: area.areaNo,
                uciId: area.uci,
                campaign: area.campaign
            }, "Field Team operational context resolved")
        );
    }

    throw new ApiError(400, "Unrecognized user role");
});