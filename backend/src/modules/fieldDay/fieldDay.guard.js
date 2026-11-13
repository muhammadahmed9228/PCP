import { Area } from "../areas/area.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { getTeamDayState } from "./fieldDay.state.js";

// A transactional write to the same area serializes team saves with AIC day changes.
export const assertEnabledFieldDay = async ({ assignment, campaignDay, actor, session, write = false }) => {
    if (actor?.role === "AIC" && write) {
        if (!session) throw new ApiError(503, "Field day writes require a database transaction.");
        // Existing AIC corrections remain permitted, including on a closed day.
        const area = await Area.findOneAndUpdate({ _id: assignment.area, campaign: assignment.campaign, aic: actor._id },
            { $inc: { "fieldDay.writeSerial": 1 } }, { session, new: true });
        if (!area) throw new ApiError(403, "This assignment is not in your area.");
        return;
    }
    if (actor?.role !== "FieldTeam") return;
    const scope = { _id: assignment.area, campaign: assignment.campaign, aic: actor.registeredBy };
    if (write && !session) throw new ApiError(503, "Field day writes require a database transaction.");
    const area = write
        ? await Area.findOneAndUpdate(scope, { $inc: { "fieldDay.writeSerial": 1 } }, { session, new: true })
        : await Area.findOne(scope);
    if (!area || getTeamDayState(area, actor._id, actor.teamType).enabledDay !== Number(campaignDay)) {
        throw new ApiError(409, "Your AIC has not enabled this day for your team, or has closed it. Your draft remains assigned to its original day. Refresh the working day or contact your AIC.");
    }
};
