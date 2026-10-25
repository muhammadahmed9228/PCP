import { Route, Point } from "./geography.model.js";
import { Area } from "../areas/area.model.js";
import { Campaign } from "../campaigns/campaign.model.js";
import { Team } from "../teams/team.model.js";
import { ApiError } from "../../utils/ApiError.js";

const verifyAreaAndCampaign = async (areaId, aicId) => {
    const area = await Area.findById(areaId);
    if (!area || area.aic.toString() !== aicId.toString()) {
        throw new ApiError(403, "Unauthorized access to this Area");
    }

    const campaign = await Campaign.findById(area.campaign);
    if (!campaign) {
        throw new ApiError(404, "Campaign not found");
    }
    if (campaign.status !== "Planning") {
        throw new ApiError(403, "Geography can only be modified during the Planning phase");
    }

    return { area, campaign };
};

/**
 * Validates that the team belongs to this AIC and has the expected type.
 * @param {string} teamId
 * @param {string} aicId
 * @param {string[]} allowedTypes  e.g. ["Mobile"] for routes, ["Fixed","Transit"] for points
 */
const verifyTeam = async (teamId, aicId, allowedTypes) => {
    const team = await Team.findOne({ _id: teamId, registeredBy: aicId }).select("teamType teamNo leader");
    if (!team) {
        throw new ApiError(404, "Team not found or does not belong to this AIC");
    }
    if (!allowedTypes.includes(team.teamType)) {
        throw new ApiError(400, `Only ${allowedTypes.join("/")} teams can be assigned to this geography type`);
    }
    return team;
};

export const createRouteService = async (payload, aicId) => {
    const { area, campaign } = await verifyAreaAndCampaign(payload.areaId, aicId);
    await verifyTeam(payload.team, aicId, ["Mobile"]);

    return await Route.create({
        routeNo: payload.routeNo,
        routeName: payload.routeName,
        routeSequence: payload.routeSequence,
        routeDescription: payload.routeDescription,
        campaignDay: payload.campaignDay,
        team: payload.team,
        campaign: campaign._id,
        uci: area.uci,
        aic: aicId,
        area: area._id
    });
};

export const createPointService = async (payload, aicId) => {
    const { area, campaign } = await verifyAreaAndCampaign(payload.areaId, aicId);
    await verifyTeam(payload.team, aicId, ["Fixed", "Transit"]);

    return await Point.create({
        pointNo: payload.pointNo,
        pointName: payload.pointName,
        // pointSequence intentionally omitted — not needed for Fixed/Transit[cite: 1]
        pointDescription: payload.pointDescription,
        pointType: payload.pointType,
        campaignDay: payload.campaignDay,
        team: payload.team,
        campaign: campaign._id,
        uci: area.uci,
        aic: aicId,
        area: area._id
    });
};

export const getGeographyForAreaService = async (areaId, userOrId) => {
    const area = await Area.findById(areaId);
    if (!area) {
        throw new ApiError(404, "Area not found");
    }

    let isAuthorized = false;
    let user = userOrId;
    const userId = userOrId?._id ? userOrId._id.toString() : userOrId?.toString();

    if (!user?.role) {
        if (area.aic.toString() === userId || area.uci.toString() === userId) {
            isAuthorized = true;
        } else {
            const team = await Team.findById(userId);
            if (team) {
                user = team;
            }
        }
    }

    if (!isAuthorized && user?.role) {
        if (user.role === "AIC") {
            isAuthorized = area.aic.toString() === userId;
        } else if (user.role === "FieldTeam") {
            const registeredBy = user.registeredBy?._id
                ? user.registeredBy._id.toString()
                : user.registeredBy?.toString();
            if (registeredBy && registeredBy === area.aic.toString()) {
                isAuthorized = true;
            } else {
                const hasAssignment = await Point.exists({ area: areaId, team: userId })
                    || await Route.exists({ area: areaId, team: userId });
                if (hasAssignment) isAuthorized = true;
            }
        } else if (user.role === "UCI") {
            isAuthorized = area.uci.toString() === userId;
        }
    }

    if (!isAuthorized) {
        throw new ApiError(403, "Unauthorized access to this Area");
    }

    // Populate teamNo, teamType, and leader so the UI can display full team info
    const routes = await Route.find({ area: areaId })
        .populate("team", "teamNo teamType leader")
        .sort({ campaignDay: 1, routeSequence: 1 });

    const points = await Point.find({ area: areaId })
        .populate("team", "teamNo teamType leader")
        .sort({ campaignDay: 1 });

    return { routes, points };
};