import { TallySheet } from "./tallySheet.model.js";
import { OMP } from "../omp/omp.model.js";
import { Campaign } from "../campaigns/campaign.model.js";
import { Team } from "../teams/team.model.js";
import { AIC } from "../users/aic.model.js";
import { UCI } from "../users/uci.model.js";
import { ApiError } from "../../utils/ApiError.js";

export const saveTallySheetDraft = async (teamId, campaignDay, userId, payload) => {
    // 1. Verify Team ownership
    const team = await Team.findById(teamId);
    if (!team || team.teamType !== "Mobile") {
        throw new ApiError(403, "Invalid team. Tally sheets belong exclusively to Mobile Teams.");
    }

    // 2. Fetch the Finalized OMP for this Team and Day to guarantee planning alignment
    const omp = await OMP.findOne({ team: teamId, campaignDay });
    if (!omp || omp.status !== "Finalized") {
        throw new ApiError(400, `Cannot generate Tally Sheet: A Finalized OMP is required for Team ${team.teamNo} on Day ${campaignDay}.`);
    }

    // 3. Verify Campaign Status
    const campaign = await Campaign.findById(omp.campaign);
    if (campaign.status !== "Active") {
        throw new ApiError(403, "Field sheets can only be generated and modified when the Campaign is 'Active'.");
    }

    // 4. Check if already finalized
    let tallySheet = await TallySheet.findOne({ team: teamId, campaignDay });
    if (tallySheet && tallySheet.status === "Finalized") {
        throw new ApiError(403, "This Tally Sheet is already finalized and locked.");
    }

    // 5. Clone Sections 1-4 (snapshot) from the team's Finalized OMP for that day
    const aic = await AIC.findById(omp.aic);
    const uci = await UCI.findById(omp.uci);

    const snapshot = {
        campaignName: omp.campaignName,
        sia: omp.sia,
        uciName: omp.uciName,
        uciNo: omp.uciNo,
        aicName: omp.aicName || aic?.aicName || "N/A",
        aicNo: omp.aicNo || aic?.phoneNumber || "N/A",
        province: omp.province || uci?.province || "N/A",
        district: omp.district || uci?.district || "N/A",
        tehsil: omp.tehsil || uci?.townTehsil || "N/A",
        ucName: omp.ucName,
        ucNo: omp.ucNumber,
        areaName: omp.areaName,
        areaNo: omp.areaNo,
        routeName: omp.routeName,
        routeNo: omp.routeNo,
        teamNo: omp.teamNo,
        teamLeaderName: omp.teamLeader?.name || team.leader?.name || "",
        teamMemberName: omp.teamMember?.name || team.member?.name || ""
    };

    const dataToSave = {
        ...payload,
        snapshot,
        campaign: omp.campaign,
        area: omp.area,
        uci: omp.uci,
        aic: omp.aic,
        route: omp.route,
        team: teamId,
        campaignDay,
        status: "Draft"
    };

    if (tallySheet) {
        tallySheet = await TallySheet.findByIdAndUpdate(tallySheet._id, dataToSave, { new: true, runValidators: true });
    } else {
        tallySheet = await TallySheet.create(dataToSave);
    }

    return tallySheet;
};

export const getTallySheetData = async (teamId, campaignDay) => {
    let tallySheet = await TallySheet.findOne({ team: teamId, campaignDay });
    if (tallySheet) return tallySheet;

    // If draft doesn't exist yet, check for Finalized OMP to clone snapshot for viewing
    const omp = await OMP.findOne({ team: teamId, campaignDay, status: "Finalized" });
    if (!omp) {
        return null;
    }

    const team = await Team.findById(teamId);
    const aic = await AIC.findById(omp.aic);
    const uci = await UCI.findById(omp.uci);

    const snapshot = {
        campaignName: omp.campaignName,
        sia: omp.sia,
        uciName: omp.uciName,
        uciNo: omp.uciNo,
        aicName: omp.aicName || aic?.aicName || "N/A",
        aicNo: omp.aicNo || aic?.phoneNumber || "N/A",
        province: omp.province || uci?.province || "N/A",
        district: omp.district || uci?.district || "N/A",
        tehsil: omp.tehsil || uci?.townTehsil || "N/A",
        ucName: omp.ucName,
        ucNo: omp.ucNumber,
        areaName: omp.areaName,
        areaNo: omp.areaNo,
        routeName: omp.routeName,
        routeNo: omp.routeNo,
        teamNo: omp.teamNo,
        teamLeaderName: omp.teamLeader?.name || team?.leader?.name || "",
        teamMemberName: omp.teamMember?.name || team?.member?.name || ""
    };

    return {
        snapshot,
        campaign: omp.campaign,
        area: omp.area,
        uci: omp.uci,
        aic: omp.aic,
        route: omp.route,
        team: teamId,
        campaignDay,
        status: "Draft",
        households: [],
        unvaccinatedChildren: [],
        refusedAbsentGuests: [],
        schools: [],
        routineImmunization: [],
        weaknessParalysis: []
    };
};

export const finalizeTallySheet = async (teamId, campaignDay) => {
    const tallySheet = await TallySheet.findOne({ team: teamId, campaignDay });
    if (!tallySheet) throw new ApiError(404, "Tally Sheet draft not found.");

    if (tallySheet.status === "Finalized") {
        throw new ApiError(400, "Tally Sheet is already finalized.");
    }

    // Enforce basic structural presence before finalizing
    if (!tallySheet.headOfFirstHouse || !tallySheet.headOfLastHouse) {
        throw new ApiError(400, "Cannot finalize: Head of First House and Last House are required.");
    }

    tallySheet.status = "Finalized";
    await tallySheet.save();

    return tallySheet;
};