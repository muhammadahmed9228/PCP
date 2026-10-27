import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { Area } from "../areas/area.model.js";
import { Campaign } from "../campaigns/campaign.model.js";
import { Team } from "../teams/team.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { getFieldTeamAssignments } from "../shared/fieldTeamAssignments.js";

export const getOperationalContext = asyncHandler(async (req, res) => {
    const { _id, role } = req.user;

    // 1. If logged in as UCI
    if (role === "UCI") {
        // Operational context must never fall back to a completed historical campaign.
        const activeCampaign = await Campaign.findOne({ uci: _id, status: "Active" })
            || await Campaign.findOne({ uci: _id, status: { $ne: "Completed" } }).sort({ createdAt: -1 });
        
        return res.status(200).json(
            new ApiResponse(200, {
                role: "UCI",
                uciId: _id,
                campaign: activeCampaign || null,
                assignments: []
            }, "UCI context resolved")
        );
    }

    // 2. If logged in as AIC
    if (role === "AIC") {
        const areas = await Area.find({ aic: _id })
            .populate({ path: "campaign", match: { status: { $in: ["Active", "Planning", "Paused"] } } })
            .populate("uci", "uciName uciNo ucNumber ucName province district townTehsil")
            .sort({ createdAt: -1 });
        const area = areas.find((candidate) => candidate.campaign?.status === "Active")
            || areas.find((candidate) => candidate.campaign?.status === "Planning")
            || areas.find((candidate) => candidate.campaign?.status === "Paused");
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
                areaImage: area.areaImage || null,
                uciId: area.uci?._id || area.uci,
                uciName: area.uci?.uciName || null,
                uciNo: area.uci?.uciNo || null,
                ucNumber: area.uci?.ucNumber || null,
                ucName: area.uci?.ucName || null,
                province: area.uci?.province || null,
                district: area.uci?.district || null,
                townTehsil: area.uci?.townTehsil || null,
                campaign: area.campaign,
                assignments: []
            }, "AIC operational context resolved")
        );
    }

    // 3. If logged in as FieldTeam (Mobile, Fixed, or Transit)
    if (role === "FieldTeam") {
        const team = await Team.findById(_id);
        if (!team) throw new ApiError(404, "Team not found.");

        // Team is registered by an AIC; find that AIC's Area
        const areas = await Area.find({ aic: team.registeredBy })
            .populate({ path: "campaign", match: { status: "Active" } });
        const area = areas.find((candidate) => candidate.campaign);
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
                areaImage: area.areaImage || null,
                uciId: area.uci,
                campaign: area.campaign,
                assignments: (await getFieldTeamAssignments(team._id)).assignments
            }, "Field Team operational context resolved")
        );
    }

    throw new ApiError(400, "Unrecognized user role");
});
