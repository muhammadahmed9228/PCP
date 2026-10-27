import { FixedSheet } from "./fixedSheet.model.js";
import { Area } from "../areas/area.model.js";
import { UCI } from "../users/uci.model.js";
import { AIC } from "../users/aic.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { refreshDraftForm2A } from "../form2a/form2a.service.js";
import { withMongoTransaction } from "../../utils/mongoTransaction.js";
import { assertTeamActor, resolveTeamAssignment } from "../shared/fieldTeamAssignments.js";

export const saveFixedSheetDraft = async (teamId, campaignDay, pointId, actor, payload) => {
    const editablePayload = { ...payload };
    delete editablePayload.status;
    delete editablePayload.finalizedAt;
    delete editablePayload.reopenedBy;
    delete editablePayload.reopenReason;
    delete editablePayload.reopenedAt;
    const { campaignId } = editablePayload;
    delete editablePayload.campaignId;

    // 1. Verify Team (Must be "Fixed" type)
    const team = await assertTeamActor(teamId, actor, "Fixed");

    // 2. Requires pointId where pointType === "Fixed"
    if (!pointId) {
        throw new ApiError(400, "Point ID is required where pointType === 'Fixed'");
    }

    const { assignment: point, campaign } = await resolveTeamAssignment({
        teamId,
        campaignDay,
        assignmentId: pointId,
        campaignId,
        teamType: "Fixed",
        requireAssignmentId: true
    });

    const area = await Area.findById(point.area);
    const uci = await UCI.findById(area.uci);
    const aic = await AIC.findById(area.aic);

    // 3. Campaign Status Check
    if (campaign.status !== "Active") {
        throw new ApiError(403, "Field sheets can only be modified when the Campaign is 'Active'.");
    }

    // 4. Duplicate/Status Check
    let fixedSheet = await FixedSheet.findOne({ campaign: campaign._id, team: teamId, campaignDay, point: point._id });
    if (fixedSheet && fixedSheet.status === "Finalized") {
        throw new ApiError(403, "This Fixed Sheet is already finalized and locked.");
    }

    // 5. Build snapshot from Campaign, UCI, AIC, Area, Point, Team
    const snapshot = {
        campaignName: campaign.campaignName,
        sia: campaign.nameOfSIA,
        sid: campaign.nameOfSIA,
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
        fixedPointName: point.pointName,
        fixedPointNumber: point.pointNo,
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

    if (fixedSheet) {
        fixedSheet = await FixedSheet.findByIdAndUpdate(fixedSheet._id, dataToSave, { new: true, runValidators: true });
    } else {
        fixedSheet = await FixedSheet.create(dataToSave);
    }

    return fixedSheet;
};

export const getFixedSheetData = async (teamId, campaignDay, pointId, actor, campaignId) => {
    const team = await assertTeamActor(teamId, actor, "Fixed");
    const { assignment: point, campaign } = await resolveTeamAssignment({
        teamId,
        campaignDay,
        assignmentId: pointId,
        campaignId,
        teamType: "Fixed",
        requireAssignmentId: actor.role === "FieldTeam"
    });
    let fixedSheet = await FixedSheet.findOne({ campaign: campaign._id, team: teamId, campaignDay, point: point._id });
    if (fixedSheet) return fixedSheet;

    // If draft does not exist yet, build a preview snapshot from the assignment.
    if (point) {
        const area = await Area.findById(point.area);
        const uci = await UCI.findById(area.uci);
        const aic = await AIC.findById(area.aic);

        const snapshot = {
            campaignName: campaign.campaignName,
            sia: campaign.nameOfSIA,
            sid: campaign.nameOfSIA,
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
            fixedPointName: point.pointName,
            fixedPointNumber: point.pointNo,
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
            vaccinatedChildren: [],
            unvaccinatedChildren: [],
            weaknessParalysis: []
        };
    }

    return null;
};

export const finalizeFixedSheet = async (teamId, campaignDay, actor, campaignId, pointId, session = null) => {
    if (!session) {
        return withMongoTransaction((transactionSession) =>
            finalizeFixedSheet(teamId, campaignDay, actor, campaignId, pointId, transactionSession)
        );
    }

    const fixedSheet = await FixedSheet.findOne({ team: teamId, campaignDay, ...(campaignId ? { campaign: campaignId } : {}), ...(pointId ? { point: pointId } : {}) }).session(session);
    if (!fixedSheet) throw new ApiError(404, "Fixed Sheet draft not found.");

    await assertTeamActor(teamId, actor, "Fixed");
    const { assignment, campaign } = await resolveTeamAssignment({
        teamId,
        campaignDay,
        assignmentId: pointId || fixedSheet.point,
        campaignId: campaignId || fixedSheet.campaign,
        teamType: "Fixed",
        session,
        requireAssignmentId: actor.role === "FieldTeam"
    });
    if (String(fixedSheet.point) !== String(assignment._id) || String(fixedSheet.campaign) !== String(campaign._id)) {
        throw new ApiError(409, "The selected assignment does not match this Fixed Sheet.");
    }

    if (fixedSheet.status === "Finalized") {
        throw new ApiError(400, "Fixed Sheet is already finalized.");
    }

    fixedSheet.status = "Finalized";
    fixedSheet.finalizedAt = new Date();
    await fixedSheet.save({ session }); // Triggers auto-calculations in pre-save hook
    await refreshDraftForm2A(fixedSheet.area, campaignDay, fixedSheet.aic, session);

    return fixedSheet;
};
