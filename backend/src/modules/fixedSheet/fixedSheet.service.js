import { FixedSheet } from "./fixedSheet.model.js";
import { Point } from "../geography/geography.model.js";
import { Area } from "../areas/area.model.js";
import { Campaign } from "../campaigns/campaign.model.js";
import { UCI } from "../users/uci.model.js";
import { Team } from "../teams/team.model.js";
import { AIC } from "../users/aic.model.js";
import { ApiError } from "../../utils/ApiError.js";

export const saveFixedSheetDraft = async (teamId, campaignDay, pointId, userId, payload) => {
    // 1. Verify Team (Must be "Fixed" type)
    const team = await Team.findById(teamId);
    if (!team || team.teamType !== "Fixed") {
        throw new ApiError(403, "Invalid team. Fixed sheets belong exclusively to Fixed Teams.");
    }

    // 2. Requires pointId where pointType === "Fixed"
    if (!pointId) {
        throw new ApiError(400, "Point ID is required where pointType === 'Fixed'");
    }

    const point = await Point.findById(pointId);
    if (!point || point.pointType !== "Fixed") {
        throw new ApiError(400, "Invalid Point. Point must have pointType === 'Fixed'.");
    }

    const area = await Area.findById(point.area);
    const campaign = await Campaign.findById(area.campaign);
    const uci = await UCI.findById(area.uci);
    const aic = await AIC.findById(area.aic);

    // 3. Campaign Status Check
    if (campaign.status !== "Active") {
        throw new ApiError(403, "Field sheets can only be modified when the Campaign is 'Active'.");
    }

    // 4. Duplicate/Status Check
    let fixedSheet = await FixedSheet.findOne({ team: teamId, campaignDay });
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
        ...payload,
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

export const getFixedSheetData = async (teamId, campaignDay, pointId) => {
    let fixedSheet = await FixedSheet.findOne({ team: teamId, campaignDay });
    if (fixedSheet) return fixedSheet;

    // If draft does not exist yet, find point and build preview snapshot
    let point = null;
    if (pointId) {
        point = await Point.findById(pointId);
    } else {
        point = await Point.findOne({ team: teamId, campaignDay, pointType: "Fixed" });
    }

    if (point && point.pointType === "Fixed") {
        const team = await Team.findById(teamId);
        const area = await Area.findById(point.area);
        const campaign = await Campaign.findById(area.campaign);
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

export const finalizeFixedSheet = async (teamId, campaignDay) => {
    const fixedSheet = await FixedSheet.findOne({ team: teamId, campaignDay });
    if (!fixedSheet) throw new ApiError(404, "Fixed Sheet draft not found.");

    if (fixedSheet.status === "Finalized") {
        throw new ApiError(400, "Fixed Sheet is already finalized.");
    }

    fixedSheet.status = "Finalized";
    await fixedSheet.save(); // Triggers auto-calculations in pre-save hook

    return fixedSheet;
};