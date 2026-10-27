import { TransitSheet } from "./transitSheet.model.js";
import { Area } from "../areas/area.model.js";
import { UCI } from "../users/uci.model.js";
import { AIC } from "../users/aic.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { refreshDraftForm2A } from "../form2a/form2a.service.js";
import { withMongoTransaction } from "../../utils/mongoTransaction.js";
import { assertTeamActor, resolveTeamAssignment } from "../shared/fieldTeamAssignments.js";

export const saveTransitSheetDraft = async (teamId, campaignDay, pointId, actor, payload) => {
    const editablePayload = { ...payload };
    delete editablePayload.status;
    delete editablePayload.finalizedAt;
    delete editablePayload.reopenedBy;
    delete editablePayload.reopenReason;
    delete editablePayload.reopenedAt;
    const { campaignId } = editablePayload;
    delete editablePayload.campaignId;

    // 1. Verify Team (Must be "Transit" type)
    const team = await assertTeamActor(teamId, actor, "Transit");

    // 2. Requires pointId where pointType === "Transit"
    if (!pointId) {
        throw new ApiError(400, "Point ID is required where pointType === 'Transit'");
    }

    const { assignment: point, campaign } = await resolveTeamAssignment({
        teamId,
        campaignDay,
        assignmentId: pointId,
        campaignId,
        teamType: "Transit",
        requireAssignmentId: true
    });

    const area = await Area.findById(point.area);
    const uci = await UCI.findById(area.uci);
    const aic = await AIC.findById(area.aic);

    if (campaign.status !== "Active") {
        throw new ApiError(403, "Field sheets can only be modified when the Campaign is 'Active'.");
    }

    let transitSheet = await TransitSheet.findOne({ campaign: campaign._id, team: teamId, campaignDay, point: point._id });
    if (transitSheet && transitSheet.status === "Finalized") {
        throw new ApiError(403, "This Transit Sheet is already finalized and locked.");
    }

    // 3. Build snapshot from Campaign, UCI, AIC, Area, Point, Team
    const snapshot = {
        campaignName: campaign.campaignName,
        sia: campaign.nameOfSIA,
        uciName: uci.uciName,
        uciNo: uci.uciNo,
        aicName: aic.aicName,
        aicNo: aic.phoneNumber, 
        province: uci.province || "N/A",
        district: uci.district || "N/A",
        tehsil: uci.townTehsil || "N/A",
        ucName: uci.ucName,
        ucNo: uci.ucNumber,
        areaName: area.areaName,
        areaNo: area.areaNo,
        transitPointName: point.pointName,
        transitPointNumber: point.pointNo,
        teamNo: team.teamNo,
        teamLeaderName: team.leader?.name || "",
        teamMemberName: team.member?.name || ""
    };

    const dataToSave = {
        ...editablePayload,
        snapshot,
        campaign: campaign._id,
        area: area._id,
        uci: uci._id,
        aic: aic._id,
        point: point._id,
        team: teamId,
        campaignDay,
        status: "Draft"
    };

    if (transitSheet) {
        transitSheet = await TransitSheet.findByIdAndUpdate(transitSheet._id, dataToSave, { new: true, runValidators: true });
    } else {
        transitSheet = await TransitSheet.create(dataToSave);
    }

    return transitSheet;
};

export const getTransitSheetData = async (teamId, campaignDay, pointId, actor, campaignId) => {
    const team = await assertTeamActor(teamId, actor, "Transit");
    const { assignment: point, campaign } = await resolveTeamAssignment({
        teamId,
        campaignDay,
        assignmentId: pointId,
        campaignId,
        teamType: "Transit",
        requireAssignmentId: actor.role === "FieldTeam"
    });
    let transitSheet = await TransitSheet.findOne({ campaign: campaign._id, team: teamId, campaignDay, point: point._id });
    if (transitSheet) return transitSheet;

    if (point) {
        const area = await Area.findById(point.area);
        const uci = await UCI.findById(area.uci);
        const aic = await AIC.findById(area.aic);

        const snapshot = {
            campaignName: campaign.campaignName,
            sia: campaign.nameOfSIA,
            uciName: uci.uciName,
            uciNo: uci.uciNo,
            aicName: aic.aicName,
            aicNo: aic.phoneNumber, 
            province: uci.province || "N/A",
            district: uci.district || "N/A",
            tehsil: uci.townTehsil || "N/A",
            ucName: uci.ucName,
            ucNo: uci.ucNumber,
            areaName: area.areaName,
            areaNo: area.areaNo,
            transitPointName: point.pointName,
            transitPointNumber: point.pointNo,
            teamNo: team.teamNo,
            teamLeaderName: team.leader?.name || "",
            teamMemberName: team.member?.name || ""
        };

        return {
            snapshot,
            campaign: campaign._id,
            area: area._id,
            uci: uci._id,
            aic: aic._id,
            point: point._id,
            team: teamId,
            campaignDay,
            status: "Draft",
            vaccinatedChildrenCount: 0
        };
    }

    return null;
};

export const finalizeTransitSheet = async (teamId, campaignDay, actor, campaignId, pointId, session = null) => {
    if (!session) {
        return withMongoTransaction((transactionSession) =>
            finalizeTransitSheet(teamId, campaignDay, actor, campaignId, pointId, transactionSession)
        );
    }

    const transitSheet = await TransitSheet.findOne({ team: teamId, campaignDay, ...(campaignId ? { campaign: campaignId } : {}), ...(pointId ? { point: pointId } : {}) }).session(session);
    if (!transitSheet) throw new ApiError(404, "Transit Sheet draft not found.");

    await assertTeamActor(teamId, actor, "Transit");
    const { assignment, campaign } = await resolveTeamAssignment({
        teamId,
        campaignDay,
        assignmentId: pointId || transitSheet.point,
        campaignId: campaignId || transitSheet.campaign,
        teamType: "Transit",
        session,
        requireAssignmentId: actor.role === "FieldTeam"
    });
    if (String(transitSheet.point) !== String(assignment._id) || String(transitSheet.campaign) !== String(campaign._id)) {
        throw new ApiError(409, "The selected assignment does not match this Transit Sheet.");
    }
    if (transitSheet.status === "Finalized") throw new ApiError(400, "Transit Sheet is already finalized.");

    transitSheet.status = "Finalized";
    transitSheet.finalizedAt = new Date();
    await transitSheet.save({ session });
    await refreshDraftForm2A(transitSheet.area, campaignDay, transitSheet.aic, session);
    return transitSheet;
};
