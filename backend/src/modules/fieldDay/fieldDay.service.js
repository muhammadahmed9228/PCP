import mongoose from "mongoose";
import { Area } from "../areas/area.model.js";
import { Campaign } from "../campaigns/campaign.model.js";
import { Team } from "../teams/team.model.js";
import { Route, Point } from "../geography/geography.model.js";
import { OMP } from "../omp/omp.model.js";
import { TallySheet } from "../tallySheet/tallySheet.model.js";
import { FixedSheet } from "../fixedSheet/fixedSheet.model.js";
import { TransitSheet } from "../transitSheet/transitSheet.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { withMongoTransaction } from "../../utils/mongoTransaction.js";
import { getTeamDayState, teamDayActionAllowed } from "./fieldDay.state.js";

const queryIn = (query, session) => session ? query.session(session) : query;
const same = (a, b) => String(a) === String(b);

const ownedArea = async (areaId, actor, session) => {
    if (actor?.role !== "AIC") throw new ApiError(403, "Only the owning AIC can manage field days.");
    if (typeof areaId !== "string" || !mongoose.isObjectIdOrHexString(areaId)) throw new ApiError(400, "Invalid area ID.");
    const area = await queryIn(Area.findOne({ _id: areaId, aic: actor._id }), session);
    if (!area) throw new ApiError(404, "Area not found or unauthorized.");
    const campaign = await queryIn(Campaign.findById(area.campaign), session);
    if (!campaign) throw new ApiError(404, "Campaign not found.");
    return { area, campaign };
};

export const getDayRoster = async (area, day, session = null) => {
    const scope = { area: area._id, campaign: area.campaign, aic: area.aic, campaignDay: day };
    // Keep reads sequential inside MongoDB transactions.
    const teams = await queryIn(Team.find({ registeredBy: area.aic }).select("teamNo teamType"), session);
    const routes = await queryIn(Route.find(scope), session);
    const points = await queryIn(Point.find(scope), session);
    const omps = await queryIn(OMP.find(scope), session);
    const tally = await queryIn(TallySheet.find(scope).select("team route status"), session);
    const fixed = await queryIn(FixedSheet.find(scope).select("team point status"), session);
    const transit = await queryIn(TransitSheet.find(scope).select("team point status"), session);
    const rows = teams.filter(team => day <= (team.teamType === "Mobile" ? 3 : 7)).map(team => {
        const mobile = team.teamType === "Mobile";
        const assignments = (mobile ? routes : points.filter(p => p.pointType === team.teamType)).filter(a => same(a.team, team._id));
        const assignment = assignments[0];
        const sheets = mobile ? tally : team.teamType === "Fixed" ? fixed : transit;
        const sheet = assignment && sheets.find(s => same(s.team, team._id) && same(mobile ? s.route : s.point, assignment._id));
        const planningReady = !mobile || omps.some(o => same(o.team, team._id) && same(o.route, assignment?._id) && o.status === "Finalized");
        const row = { teamId: team._id, teamNo: team.teamNo, teamType: team.teamType,
            assignment: assignment ? `${mobile ? assignment.routeNo : assignment.pointNo} — ${mobile ? assignment.routeName : assignment.pointName}` : null,
            assignmentCount: assignments.length, planningReady, status: sheet?.status || "Not started",
            unfinishedSheets: sheets.filter(s => same(s.team, team._id) && s.status !== "Finalized").length,
            ...getTeamDayState(area, team._id, team.teamType) };
        return { ...row, canEnable: teamDayActionAllowed(row, day, "enable"), canClose: teamDayActionAllowed(row, day, "close"),
            dayStatus: row.enabledDay === day ? "Enabled" : row.lastDay != null && day <= row.lastDay ? "Closed" : "Not enabled" };
    });
    const unfinishedSheets = [...tally, ...fixed, ...transit].filter(s => s.status !== "Finalized").length;
    return { rows, unfinishedSheets };
};

export const assertDayReady = ({ rows, unfinishedSheets }, action) => {
    if (!rows.length) throw new ApiError(409, "No eligible field teams exist for this day.");
    if (rows.some(r => r.assignmentCount !== 1)) throw new ApiError(409, "Each eligible team needs exactly one assigned route or point for this day.");
    if (action === "enable" && rows.some(r => !r.planningReady)) throw new ApiError(409, "Finalize the Mobile teams' OMPs before enabling this day.");
    if (action === "close" && (unfinishedSheets || rows.some(r => r.status !== "Finalized"))) {
        throw new ApiError(409, "All required field sheets must be finalized before closing this day.");
    }
};

export const getFieldDays = async (areaId, actor) => {
    const { area, campaign } = await ownedArea(areaId, actor);
    const days = [];
    for (let day = 1; day <= 7; day++) days.push({ day, ...await getDayRoster(area, day) });
    return { areaId: area._id, campaignStatus: campaign.status, revision: area.fieldDay?.revision || 0,
        history: area.fieldDay?.history || [], days };
};

export const changeFieldDay = async (areaId, actor, input) => {
    const { action, day, revision, teamIds } = input || {};
    if (!["enable", "close"].includes(action) || !Number.isInteger(day) || day < 1 || day > 7 || !Number.isSafeInteger(revision) || revision < 0) {
        throw new ApiError(400, "Provide a valid action, campaign day (1–7), and revision.");
    }
    if (!Array.isArray(teamIds) || teamIds.length < 1 || teamIds.length > 100 ||
        teamIds.some(id => typeof id !== "string" || !mongoose.isObjectIdOrHexString(id)) ||
        new Set(teamIds.map(id => id.toLowerCase())).size !== teamIds.length) {
        throw new ApiError(400, "Select between 1 and 100 distinct team IDs. Global day changes are no longer supported.");
    }
    const selectedIds = new Set(teamIds.map(id => id.toLowerCase()));
    await withMongoTransaction(async session => {
        const { area, campaign } = await ownedArea(areaId, actor, session);
        if (campaign.status !== "Active") throw new ApiError(403, "Field days can only be managed in an Active campaign.");
        const state = area.fieldDay || {};
        if ((state.revision || 0) !== revision) throw new ApiError(409, "The field day changed. Refresh and try again.");
        const roster = await getDayRoster(area, day, session);
        const rows = roster.rows.filter(row => selectedIds.has(String(row.teamId)));
        if (rows.length !== selectedIds.size) throw new ApiError(403, "A selected team is not owned by this AIC or is not eligible for this day.");
        for (const row of rows) {
            if (action === "close" && row.enabledDay !== day) throw new ApiError(409, `Team ${row.teamNo}: this is not the enabled day.`);
            if (action === "enable") {
                if (row.enabledDay != null) throw new ApiError(409, `Team ${row.teamNo}: close its current day first.`);
                if (row.lastDay != null && day !== row.lastDay + 1) throw new ApiError(409, `Team ${row.teamNo}: enable its next day in sequence.`);
            }
            assertDayReady({ rows: [row], unfinishedSheets: row.unfinishedSheets }, action);
        }
        // Writes to this document conflict with concurrent sheet saves/finalization;
        // MongoDB retries the transaction, including the roster checks, on a conflict.
        await Area.updateOne({ _id: area._id, aic: actor._id }, { $inc: { "fieldDay.writeSerial": 1 } }, { session });
        let teamStates;
        if (state.teamControlVersion === 1) {
            teamStates = (state.teams || []).map(item => ({ team: item.team, enabledDay: item.enabledDay ?? null, lastDay: item.lastDay ?? null }));
        } else {
            // Lazy, atomic conversion preserves every existing team's global day,
            // including teams excluded from this day's roster (Mobile after Day 3).
            const teams = await queryIn(Team.find({ registeredBy: area.aic }).select("teamType"), session);
            teamStates = teams.map(team => ({ team: team._id, ...getTeamDayState(area, team._id, team.teamType) }));
        }
        for (const row of rows) {
            const next = { team: row.teamId, enabledDay: action === "enable" ? day : null, lastDay: day };
            const index = teamStates.findIndex(item => same(item.team, row.teamId));
            if (index === -1) teamStates.push(next); else teamStates[index] = next;
        }
        await Area.updateOne({ _id: area._id, aic: actor._id }, {
            $set: { "fieldDay.teams": teamStates, "fieldDay.teamControlVersion": 1, "fieldDay.enabledDay": null, "fieldDay.lastDay": null },
            $inc: { "fieldDay.revision": 1 },
            $push: { "fieldDay.history": { action, day, teams: rows.map(row => row.teamId), actor: actor._id, at: new Date() } }
        }, { session, runValidators: true });
    });
    return getFieldDays(areaId, actor);
};
