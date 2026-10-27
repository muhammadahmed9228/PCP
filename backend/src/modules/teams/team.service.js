import { Team } from "./team.model.js";
import { Campaign } from "../campaigns/campaign.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { escapeListSearch, isPagedList, parseListQuery } from "../../utils/listQuery.js";

const requireMatchingLeaderCnic = (username, leaderCnic) => {
    if (typeof username !== "string" || typeof leaderCnic !== "string" ||
        !username.trim() || username.trim() !== leaderCnic.trim()) {
        throw new ApiError(400, "Username (CNIC) must match Team Leader CNIC");
    }
};

export const createTeam = async (payload, aicId) => {
    requireMatchingLeaderCnic(payload?.username, payload?.leader?.cnic);
    const username = payload.username.trim();
    const existingTeam = await Team.findOne({ username });
    if (existingTeam) {
        throw new ApiError(409, "Team with this Username/CNIC already exists");
    }

    return await Team.create({ ...payload, username, leader: { ...payload.leader, cnic: payload.leader.cnic.trim() }, registeredBy: aicId });
};

export const getAicTeams = async (aicId, query = {}) => {
    const paged = isPagedList(query) || ["teamType", "leaderRoleType", "leaderGender"].some(key => query[key] !== undefined);
    if (!paged) return await Team.find({ registeredBy: aicId }).select("-password -refreshToken");

    const { page, limit, search, sort, direction } = parseListQuery(query,
        ["createdAt", "teamNo", "teamType", "username", "leader.name", "member.name"]);
    const teamType = query.teamType ?? "all";
    const leaderRoleType = query.leaderRoleType ?? "all";
    const leaderGender = query.leaderGender ?? "all";
    if (!["all", "Mobile", "Fixed", "Transit"].includes(teamType)) throw new ApiError(400, "Invalid team type filter");
    if (!["all", "LHW", "Volunteer"].includes(leaderRoleType)) throw new ApiError(400, "Invalid leader role filter");
    if (!["all", "Male", "Female"].includes(leaderGender)) throw new ApiError(400, "Invalid leader gender filter");

    const conditions = { registeredBy: aicId };
    if (teamType !== "all") conditions.teamType = teamType;
    if (leaderRoleType !== "all") conditions["leader.roleType"] = leaderRoleType;
    if (leaderGender !== "all") conditions["leader.gender"] = leaderGender;
    if (search) {
        const pattern = new RegExp(escapeListSearch(search), "i");
        conditions.$or = ["teamNo", "username", "leader.name", "leader.cnic", "member.name", "member.cnic"]
            .map(field => ({ [field]: pattern }));
    }

    const [items, total, counts] = await Promise.all([
        Team.find(conditions).select("-password -refreshToken")
            .sort({ [sort]: direction, _id: direction }).skip((page - 1) * limit).limit(limit),
        Team.countDocuments(conditions),
        Team.aggregate([{ $match: conditions }, { $group: { _id: "$teamType", count: { $sum: 1 } } }])
    ]);
    const typeCounts = { Mobile: 0, Fixed: 0, Transit: 0 };
    for (const row of counts) {
        if (Object.hasOwn(typeCounts, row._id)) typeCounts[row._id] = row.count;
    }
    return { items, total, page, limit, typeCounts };
};

export const updateAicTeam = async (teamId, payload, aicId) => {
    const team = await Team.findOne({ _id: teamId, registeredBy: aicId });
    if (!team) throw new ApiError(404, "Team not found or unauthorized");

    if (payload.username !== undefined || payload.leader !== undefined) {
        requireMatchingLeaderCnic(payload.username ?? team.username, payload.leader?.cnic ?? team.leader?.cnic);
    }

    const allowedFields = ["teamNo", "teamType", "username", "password", "leader", "member"];
    for (const field of allowedFields) {
        if (payload[field] !== undefined) team[field] = payload[field];
    }
    await team.save();
    return team.toObject({ transform: (_doc, ret) => {
        delete ret.password;
        delete ret.refreshToken;
        return ret;
    }});
};

export const deleteAicTeam = async (teamId, aicId) => {
    const team = await Team.findOne({ _id: teamId, registeredBy: aicId });
    if (!team) throw new ApiError(404, "Team not found or unauthorized");

    const { Route, Point } = await import("../geography/geography.model.js");
    const assignedGeography = await Promise.all([
        Route.exists({ team: teamId }),
        Point.exists({ team: teamId })
    ]);
    if (assignedGeography.some(Boolean)) {
        throw new ApiError(400, "Cannot delete a team while routes or points are assigned to it. Unassign them first.");
    }

    await Campaign.updateMany({ teams: teamId }, { $pull: { teams: teamId } });
    await team.deleteOne();
    return { deletedId: teamId };
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
