import { TransitSheet } from "./transitSheet.model.js";
import { Point } from "../geography/geography.model.js";
import { Area } from "../areas/area.model.js";
import { Campaign } from "../campaigns/campaign.model.js";
import { UCI } from "../users/uci.model.js";
import { Team } from "../teams/team.model.js";
import { AIC } from "../users/aic.model.js";
import { ApiError } from "../../utils/ApiError.js";

export const saveTransitSheetDraft = async (teamId, campaignDay, pointId, userId, payload) => {
    // 1. Verify Team (Must be "Transit" type)
    const team = await Team.findById(teamId);
    if (!team || team.teamType !== "Transit") {
        throw new ApiError(403, "Invalid team. Transit sheets belong exclusively to Transit Teams.");
    }

    // 2. Requires pointId where pointType === "Transit"
    if (!pointId) {
        throw new ApiError(400, "Point ID is required where pointType === 'Transit'");
    }

    const point = await Point.findById(pointId);
    if (!point || point.pointType !== "Transit") {
        throw new ApiError(400, "Invalid Point. Point must have pointType === 'Transit'.");
    }

    const area = await Area.findById(point.area);
    const campaign = await Campaign.findById(area.campaign);
    const uci = await UCI.findById(area.uci);
    const aic = await AIC.findById(area.aic);

    if (campaign.status !== "Active") {
        throw new ApiError(403, "Field sheets can only be modified when the Campaign is 'Active'.");
    }

    let transitSheet = await TransitSheet.findOne({ team: teamId, campaignDay });
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

    if (transitSheet) {
        transitSheet = await TransitSheet.findByIdAndUpdate(transitSheet._id, dataToSave, { new: true, runValidators: true });
    } else {
        transitSheet = await TransitSheet.create(dataToSave);
    }

    return transitSheet;
};

export const getTransitSheetData = async (teamId, campaignDay, pointId) => {
    let transitSheet = await TransitSheet.findOne({ team: teamId, campaignDay });
    if (transitSheet) return transitSheet;

    let point = null;
    if (pointId) {
        point = await Point.findById(pointId);
    } else {
        point = await Point.findOne({ team: teamId, campaignDay, pointType: "Transit" });
    }

    if (point && point.pointType === "Transit") {
        const team = await Team.findById(teamId);
        const area = await Area.findById(point.area);
        const campaign = await Campaign.findById(area.campaign);
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

export const finalizeTransitSheet = async (teamId, campaignDay) => {
    const transitSheet = await TransitSheet.findOne({ team: teamId, campaignDay });
    if (!transitSheet) throw new ApiError(404, "Transit Sheet draft not found.");
    if (transitSheet.status === "Finalized") throw new ApiError(400, "Transit Sheet is already finalized.");

    transitSheet.status = "Finalized";
    await transitSheet.save();
    return transitSheet;
};