import { OMP } from "./omp.model.js";
import { Area } from "../areas/area.model.js";
import { Campaign } from "../campaigns/campaign.model.js";
import { UCI } from "../users/uci.model.js";
import { AIC } from "../users/aic.model.js";
import { Route } from "../geography/geography.model.js";
import { Team } from "../teams/team.model.js";
import { ApiError } from "../../utils/ApiError.js";

export const saveOMPDraft = async (teamId, campaignDay, routeId, aicId, payload) => {
    // 1. Verify Team
    const team = await Team.findById(teamId);
    if (!team || team.registeredBy.toString() !== aicId.toString() || team.teamType !== "Mobile") {
        throw new ApiError(403, "Invalid team or unauthorized. OMPs are only for assigned Mobile Teams.");
    }

    // 2. Verify Route & Area
    const route = await Route.findById(routeId);
    if (!route || route.aic.toString() !== aicId.toString()) {
        throw new ApiError(403, "Invalid route or unauthorized");
    }

    const area = await Area.findById(route.area);
    const campaign = await Campaign.findById(area.campaign);
    const uci = await UCI.findById(area.uci);
    const aic = await AIC.findById(route.aic);

    if (campaign.status !== "Planning") {
        throw new ApiError(403, "OMP can only be modified during the Planning phase");
    }

    let omp = await OMP.findOne({ campaign: campaign._id, team: team._id, campaignDay });
    if (omp && omp.status === "Finalized") {
        throw new ApiError(403, "This OMP is already finalized and locked");
    }

    // 3. Auto-populate Sections 0 & 1
    const autoPopulatedFields = {
        campaignName: campaign.campaignName,
        sia: campaign.nameOfSIA,
        uciNo: uci.uciNo,
        uciName: uci.uciName,
        ucNumber: uci.ucNumber,
        ucName: uci.ucName,
        province: uci.province || "N/A",
        district: uci.district || "N/A",
        tehsil: uci.townTehsil || "N/A",
        aicName: aic?.aicName || "N/A",
        aicNo: aic?.phoneNumber || "N/A",
        areaNo: area.areaNo,
        areaName: area.areaName,
        routeNo: route.routeNo,
        routeName: route.routeName,
        teamNo: team.teamNo,
        teamLeader: {
            name: team.leader?.name || "",
            position: team.leader?.roleType || "",
            cnic: team.leader?.cnic || "",
            states: team.leader?.states || []
        },
        teamMember: {
            name: team.member?.name || "",
            position: team.member?.roleType || "",
            cnic: team.member?.cnic || "",
            states: team.member?.states || []
        }
    };

    // 4. Server-side authoritative calculation for Grand Total Children
    const under1 = Number(payload.totalUnder1Year) || 0;
    const oneToFive = Number(payload.total1to5Years) || 0;
    const school = Number(payload.totalSchoolMadrasa) || 0;
    const grandTotalChildren = under1 + oneToFive + school;

    const dataToSave = {
        ...payload,
        ...autoPopulatedFields,
        grandTotalChildren,
        campaign: campaign._id,
        area: area._id,
        uci: uci._id,
        aic: aicId,
        route: route._id,
        team: team._id,
        campaignDay,
        status: "Draft"
    };

    if (omp) {
        omp = await OMP.findByIdAndUpdate(omp._id, dataToSave, { new: true });
    } else {
        omp = await OMP.create(dataToSave);
    }

    return omp;
};

export const getOMPData = async (teamId, campaignDay, aicId, routeId) => {
    let omp = await OMP.findOne({ team: teamId, campaignDay });
    if (omp) return omp;

    // If draft does not exist yet, find assigned route and construct auto-populated snapshot preview
    let route = null;
    if (routeId) {
        route = await Route.findById(routeId);
    } else {
        route = await Route.findOne({ team: teamId, campaignDay });
    }

    if (route) {
        const team = await Team.findById(teamId);
        const area = await Area.findById(route.area);
        const campaign = await Campaign.findById(area.campaign);
        const uci = await UCI.findById(area.uci);
        const aic = await AIC.findById(route.aic);

        return {
            campaignName: campaign.campaignName,
            sia: campaign.nameOfSIA,
            uciNo: uci.uciNo,
            uciName: uci.uciName,
            ucNumber: uci.ucNumber,
            ucName: uci.ucName,
            province: uci.province || "N/A",
            district: uci.district || "N/A",
            tehsil: uci.townTehsil || "N/A",
            aicName: aic?.aicName || "N/A",
            aicNo: aic?.phoneNumber || "N/A",
            areaNo: area.areaNo,
            areaName: area.areaName,
            routeNo: route.routeNo,
            routeName: route.routeName,
            teamNo: team.teamNo,
            teamLeader: {
                name: team.leader?.name || "",
                position: team.leader?.roleType || "",
                cnic: team.leader?.cnic || "",
                states: team.leader?.states || []
            },
            teamMember: {
                name: team.member?.name || "",
                position: team.member?.roleType || "",
                cnic: team.member?.cnic || "",
                states: team.member?.states || []
            },
            route: route._id,
            team: team._id,
            campaignDay,
            area: area._id,
            campaign: campaign._id,
            uci: uci._id,
            aic: aicId,
            status: "Draft"
        };
    }

    return null;
};

export const finalizeOMP = async (teamId, campaignDay, aicId) => {
    const omp = await OMP.findOne({ team: teamId, campaignDay, aic: aicId });
    if (!omp) throw new ApiError(404, "OMP draft not found");

    if (omp.status === "Finalized") throw new ApiError(400, "OMP is already finalized");

    // Backend validation for strict finalization rules
    const required = ["villageName", "workSequence", "areaCategory", "totalHouseholds"];
    for (const field of required) {
        if (!omp[field]) throw new ApiError(400, `Cannot finalize: ${field} is missing`);
    }

    omp.status = "Finalized";
    await omp.save();

    return omp;
};