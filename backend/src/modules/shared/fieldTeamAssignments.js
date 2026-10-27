import { Campaign } from "../campaigns/campaign.model.js";
import { FixedSheet } from "../fixedSheet/fixedSheet.model.js";
import { Point, Route } from "../geography/geography.model.js";
import { OMP } from "../omp/omp.model.js";
import { TallySheet } from "../tallySheet/tallySheet.model.js";
import { Team } from "../teams/team.model.js";
import { TransitSheet } from "../transitSheet/transitSheet.model.js";
import { ApiError } from "../../utils/ApiError.js";

const withSession = (query, session) => (session ? query.session(session) : query);

export const assertTeamActor = async (teamId, actor, expectedType = null) => {
    const team = await Team.findById(teamId).select("teamNo teamType registeredBy leader member");
    if (!team) throw new ApiError(404, "Team not found.");
    if (expectedType && team.teamType !== expectedType) {
        throw new ApiError(403, `${expectedType} sheet does not belong to this team type.`);
    }

    if (!actor?.role || !["AIC", "FieldTeam"].includes(actor.role)) {
        throw new ApiError(403, "Only the assigned AIC or Field Team can access field sheets.");
    }
    if (actor.role === "FieldTeam" && String(actor._id) !== String(team._id)) {
        throw new ApiError(403, "A Field Team can only access its own sheets.");
    }
    if (actor.role === "AIC" && String(actor._id) !== String(team.registeredBy)) {
        throw new ApiError(403, "This team is not registered by the current AIC.");
    }

    return team;
};

const getAssignmentModel = (teamType) => teamType === "Mobile" ? Route : Point;

export const resolveTeamAssignment = async ({
    teamId,
    campaignDay,
    assignmentId,
    campaignId,
    teamType,
    session = null,
    requireAssignmentId = false
}) => {
    if (requireAssignmentId && !assignmentId) {
        throw new ApiError(400, "An assigned route or point is required to open this sheet.");
    }

    const Model = getAssignmentModel(teamType);
    const filter = {
        team: teamId,
        campaignDay: Number(campaignDay),
        ...(assignmentId ? { _id: assignmentId } : {}),
        ...(campaignId ? { campaign: campaignId } : {}),
        ...(teamType === "Mobile" ? {} : { pointType: teamType })
    };
    const assignment = await withSession(Model.findOne(filter), session);
    if (!assignment) {
        throw new ApiError(403, `No ${teamType.toLowerCase()} assignment exists for this team on Day ${campaignDay}.`);
    }

    const campaign = await withSession(
        Campaign.findOne({ _id: assignment.campaign, status: "Active" }),
        session
    );
    if (!campaign) throw new ApiError(403, "This assignment is not part of an active campaign.");
    if (campaignId && String(campaign._id) !== String(campaignId)) {
        throw new ApiError(403, "The assignment does not belong to the selected campaign.");
    }

    return { assignment, campaign };
};

export const getFieldTeamAssignments = async (teamId) => {
    const team = await Team.findById(teamId).select("teamNo teamType registeredBy");
    if (!team) throw new ApiError(404, "Team not found.");

    const [routes, points] = await Promise.all([
        Route.find({ team: teamId })
            .populate({ path: "campaign", match: { status: "Active" }, select: "campaignName nameOfSIA status startDate endDate" })
            .populate("area", "areaNo areaName")
            .lean(),
        Point.find({ team: teamId })
            .populate({ path: "campaign", match: { status: "Active" }, select: "campaignName nameOfSIA status startDate endDate" })
            .populate("area", "areaNo areaName")
            .lean()
    ]);

    const activeRoutes = team.teamType === "Mobile" ? routes.filter((route) => route.campaign) : [];
    const activePoints = ["Fixed", "Transit"].includes(team.teamType)
        ? points.filter((point) => point.campaign && point.pointType === team.teamType)
        : [];
    const campaignIds = [...new Set([...activeRoutes, ...activePoints].map((item) => String(item.campaign._id)))];

    const [tallySheets, fixedSheets, transitSheets, omps] = await Promise.all([
        TallySheet.find({ team: teamId, campaign: { $in: campaignIds } }).select("campaign campaignDay status").lean(),
        FixedSheet.find({ team: teamId, campaign: { $in: campaignIds } }).select("campaign campaignDay status").lean(),
        TransitSheet.find({ team: teamId, campaign: { $in: campaignIds } }).select("campaign campaignDay status").lean(),
        OMP.find({ team: teamId, campaign: { $in: campaignIds } }).select("campaign route campaignDay status").lean()
    ]);

    const sheetStatus = (collection, item) => collection.find(
        (sheet) => String(sheet.campaign) === String(item.campaign._id) && Number(sheet.campaignDay) === Number(item.campaignDay)
    )?.status || "Not started";

    return {
        team: { _id: team._id, teamNo: team.teamNo, teamType: team.teamType },
        assignments: [
            ...activeRoutes.map((route) => ({
                assignmentId: route._id,
                assignmentType: "Route",
                teamType: "Mobile",
                campaignId: route.campaign._id,
                campaignName: route.campaign.campaignName,
                areaId: route.area?._id || route.area,
                areaNo: route.area?.areaNo || null,
                areaName: route.area?.areaName || null,
                campaignDay: route.campaignDay,
                label: `${route.routeNo} — ${route.routeName}`,
                image: route.routeImage || null,
                sheetStatus: sheetStatus(tallySheets, route),
                planningStatus: omps.find((omp) => String(omp.campaign) === String(route.campaign._id) && String(omp.route) === String(route._id) && Number(omp.campaignDay) === Number(route.campaignDay))?.status || "Not ready"
            })),
            ...activePoints.map((point) => ({
                assignmentId: point._id,
                assignmentType: "Point",
                teamType: point.pointType,
                campaignId: point.campaign._id,
                campaignName: point.campaign.campaignName,
                areaId: point.area?._id || point.area,
                areaNo: point.area?.areaNo || null,
                areaName: point.area?.areaName || null,
                campaignDay: point.campaignDay,
                label: `${point.pointNo} — ${point.pointName}`,
                image: point.pointImage || null,
                sheetStatus: point.pointType === "Fixed" ? sheetStatus(fixedSheets, point) : sheetStatus(transitSheets, point),
                planningStatus: "Ready"
            }))
        ].sort((left, right) => Number(left.campaignDay) - Number(right.campaignDay) || left.label.localeCompare(right.label))
    };
};
