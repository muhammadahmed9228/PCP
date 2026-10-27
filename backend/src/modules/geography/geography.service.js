import { Route, Point } from "./geography.model.js";
import { Area } from "../areas/area.model.js";
import { Campaign } from "../campaigns/campaign.model.js";
import { Team } from "../teams/team.model.js";
import { ApiError } from "../../utils/ApiError.js";
import mongoose from "mongoose";

const requireObjectId = (id, label) => {
    if (!mongoose.isValidObjectId(id)) throw new ApiError(400, `Invalid ${label}`);
};

const parseInteger = (value, name, fallback, min, max) => {
    if (value === undefined || value === "") return fallback;
    if (typeof value !== "string" || !/^\d+$/.test(value)) throw new ApiError(400, `Invalid ${name}`);
    const number = Number(value);
    if (!Number.isSafeInteger(number) || number < min || number > max) throw new ApiError(400, `Invalid ${name}`);
    return number;
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const listFields = {
    routes: { Model: Route, name: "routeName", number: "routeNo", description: "routeDescription", sorts: ["campaignDay", "routeSequence", "routeNo", "routeName", "createdAt"] },
    points: { Model: Point, name: "pointName", number: "pointNo", description: "pointDescription", sorts: ["campaignDay", "pointNo", "pointName", "pointType", "createdAt"] }
};

export const listGeographyForAreaService = async (areaId, aicId, kind, query = {}) => {
    requireObjectId(areaId, "area ID");
    const area = await Area.findOne({ _id: areaId, aic: aicId });
    if (!area) throw new ApiError(404, "Area not found or unauthorized");

    const config = listFields[kind];
    if (!config) throw new ApiError(400, "Invalid geography type");
    const page = parseInteger(query.page, "page", 1, 1, 100000);
    const limit = parseInteger(query.limit, "limit", 10, 1, 100);
    const day = parseInteger(query.day, "day", null, 1, kind === "routes" ? 3 : 7);
    const filter = query.filter ?? "all";
    if (!["all", "assigned", "available"].includes(filter)) throw new ApiError(400, "Invalid filter");
    const sort = query.sort ?? "campaignDay";
    if (!config.sorts.includes(sort)) throw new ApiError(400, "Invalid sort field");
    const order = query.order ?? "asc";
    if (!["asc", "desc"].includes(order)) throw new ApiError(400, "Invalid sort order");
    const search = query.search ?? "";
    if (typeof search !== "string" || search.length > 100) throw new ApiError(400, "Search must be at most 100 characters");

    const conditions = { area: area._id, campaign: area.campaign, aic: aicId };
    if (filter === "assigned") conditions.team = { $ne: null };
    if (filter === "available") conditions.team = null;
    if (query.teamId !== undefined && query.teamId !== "") {
        if (filter === "available") throw new ApiError(400, "Available records cannot be filtered by assigned team");
        requireObjectId(query.teamId, "team ID");
        conditions.team = query.teamId;
    }
    if (day !== null) conditions.campaignDay = day;
    if (kind === "points" && query.pointType !== undefined && query.pointType !== "") {
        if (!["Fixed", "Transit"].includes(query.pointType)) throw new ApiError(400, "Invalid point type");
        conditions.pointType = query.pointType;
    }
    if (search.trim()) {
        const pattern = new RegExp(escapeRegex(search.trim()), "i");
        conditions.$or = [{ [config.name]: pattern }, { [config.number]: pattern }, { [config.description]: pattern }];
    }

    const direction = order === "asc" ? 1 : -1;
    const [items, total] = await Promise.all([
        config.Model.find(conditions)
            .populate("team", "teamNo teamType leader")
            .sort({ [sort]: direction, _id: direction })
            .skip((page - 1) * limit)
            .limit(limit),
        config.Model.countDocuments(conditions)
    ]);
    return { items, total, page, limit };
};

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
    requireObjectId(teamId, "team ID");
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

const getOwnedGeography = async (Model, id, aicId) => {
    requireObjectId(id, "route or point ID");
    const item = await Model.findOne({ _id: id, aic: aicId });
    if (!item) throw new ApiError(404, "Route or point not found or unauthorized");
    return item;
};

export const updateRouteService = async (id, payload, aicId) => {
    const route = await getOwnedGeography(Route, id, aicId);
    const { campaign } = await verifyAreaAndCampaign(route.area, aicId);
    const teamId = payload.team || route.team;
    await verifyTeam(teamId, aicId, ["Mobile"]);
    ["routeNo", "routeName", "routeSequence", "routeDescription", "campaignDay"].forEach((field) => {
        if (payload[field] !== undefined) route[field] = payload[field];
    });
    route.team = teamId;
    route.campaign = campaign._id;
    await route.save();
    return route.populate("team", "teamNo teamType leader");
};

export const updatePointService = async (id, payload, aicId) => {
    const point = await getOwnedGeography(Point, id, aicId);
    const { campaign } = await verifyAreaAndCampaign(point.area, aicId);
    const teamId = payload.team || point.team;
    await verifyTeam(teamId, aicId, ["Fixed", "Transit"]);
    ["pointNo", "pointName", "pointDescription", "pointType", "campaignDay"].forEach((field) => {
        if (payload[field] !== undefined) point[field] = payload[field];
    });
    point.team = teamId;
    point.campaign = campaign._id;
    await point.save();
    return point.populate("team", "teamNo teamType leader");
};

export const deleteGeographyService = async (Model, id, aicId) => {
    const item = await getOwnedGeography(Model, id, aicId);
    await verifyAreaAndCampaign(item.area, aicId);
    await item.deleteOne();
    return { deletedId: id };
};

export const unassignGeographyService = async (Model, id, aicId) => {
    const item = await getOwnedGeography(Model, id, aicId);
    const { campaign } = await verifyAreaAndCampaign(item.area, aicId);
    if (!item.team) throw new ApiError(409, "This route or point is already available");
    const updated = await Model.findOneAndUpdate(
        { _id: item._id, aic: aicId, team: item.team },
        { $set: { team: null, campaign: campaign._id } },
        { new: true, runValidators: true }
    );
    if (!updated) throw new ApiError(409, "Assignment changed. Reload and try again");
    return updated;
};

export const assignGeographyService = async (Model, id, teamId, aicId) => {
    const item = await getOwnedGeography(Model, id, aicId);
    const { campaign } = await verifyAreaAndCampaign(item.area, aicId);
    if (item.team) throw new ApiError(409, "This route or point is already assigned");
    await verifyTeam(teamId, aicId, Model === Route ? ["Mobile"] : [item.pointType]);
    try {
        const updated = await Model.findOneAndUpdate(
            { _id: item._id, aic: aicId, team: null },
            { $set: { team: teamId, campaign: campaign._id } },
            { new: true, runValidators: true }
        );
        if (!updated) throw new ApiError(409, "Assignment changed. Reload and try again");
        return updated.populate("team", "teamNo teamType leader");
    } catch (error) {
        if (error.code === 11000) throw new ApiError(409, "This number is already assigned to that team on this day");
        throw error;
    }
};

export const getGeographyForAreaService = async (areaId, userOrId) => {
    const area = await Area.findById(areaId);
    if (!area) {
        throw new ApiError(404, "Area not found");
    }

    let isAuthorized = false;
    let fieldTeamId = null;
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
            const hasAssignment = await Point.exists({ area: areaId, team: userId })
                || await Route.exists({ area: areaId, team: userId });
            if (hasAssignment) {
                isAuthorized = true;
                fieldTeamId = userId;
            }
        } else if (user.role === "UCI") {
            isAuthorized = area.uci.toString() === userId;
        }
    }

    if (!isAuthorized) {
        throw new ApiError(403, "Unauthorized access to this Area");
    }

    // Populate teamNo, teamType, and leader so the UI can display full team info
    const geographyFilter = fieldTeamId ? { area: areaId, team: fieldTeamId } : { area: areaId };
    const routes = await Route.find(geographyFilter)
        .populate("team", "teamNo teamType leader")
        .sort({ campaignDay: 1, routeSequence: 1 });

    const points = await Point.find(geographyFilter)
        .populate("team", "teamNo teamType leader")
        .sort({ campaignDay: 1 });

    return { routes, points };
};
