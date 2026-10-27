import { Campaign } from "./campaign.model.js";
import { UCMP } from "../ucmp/ucmp.model.js";
import { AMP } from "../amp/amp.model.js";
import { OMP } from "../omp/omp.model.js";
import { Area } from "../areas/area.model.js";
import { Team } from "../teams/team.model.js";
import { ApiError } from "../../utils/ApiError.js";

export const verifyCampaignReadiness = async (campaignId, uciId) => {
    const campaign = await Campaign.findOne({ _id: campaignId, uci: uciId });
    if (!campaign) throw new ApiError(404, "Campaign not found");

    const report = {
        ucmpReady: false,
        ampsReady: false,
        ompsReady: false,
        isReady: false,
        errors: []
    };

    // 1. Check UCMP[cite: 1]
    const ucmp = await UCMP.findOne({ campaign: campaignId });
    if (ucmp && ucmp.status === "Finalized") {
        report.ucmpReady = true;
    } else {
        report.errors.push("UCMP is missing or not finalized.");
    }

    // 2. Check AMPs for all Areas[cite: 1]
    const areas = await Area.find({ campaign: campaignId });
    if (areas.length === 0) {
        report.errors.push("No areas have been created for this campaign.");
    } else {
        const areaIds = areas.map(a => a._id);
        const amps = await AMP.find({ campaign: campaignId, uci: uciId, area: { $in: areaIds }, status: "Approved" });
        const approvedByArea = new Map(amps.map(amp => [String(amp.area), amp]));
        const approvedCount = areas.filter(area => String(approvedByArea.get(String(area._id))?.aic) === String(area.aic)).length;
        if (approvedCount === areas.length) {
            report.ampsReady = true;
        } else {
            report.errors.push(`Only ${approvedCount} of ${areas.length} Areas have approved AMPs.`);
        }
    }

    // 3. Check OMPs for all Mobile Teams
    // Strategy: find mobile teams via campaign.teams[] OR via OMP records for this campaign.
    // AICs may not have explicitly called assignToCampaign, but teams submit OMPs linked
    // directly to campaignId — those records are the source of truth.

    // Collect team IDs from both sources
    const campaignTeamIds = campaign.teams || [];

    // Find all team IDs that have ANY OMP tied to this campaign
    const ompTeamIds = await OMP.distinct("team", { campaign: campaignId });

    // Merge and deduplicate
    const allTeamIdStrings = new Set([
        ...campaignTeamIds.map(id => id.toString()),
        ...ompTeamIds.map(id => id.toString())
    ]);

    // Fetch only the Mobile ones among all discovered team IDs
    const mobileTeams = await Team.find({
        _id: { $in: [...allTeamIdStrings] },
        teamType: "Mobile"
    });

    if (mobileTeams.length === 0) {
        report.errors.push("No Mobile Teams are assigned to this campaign.");
    } else {
        let allOmpsFinalized = true;
        let missingOmps = 0;

        for (const team of mobileTeams) {
            // Check Days 1, 2, and 3
            const omps = await OMP.find({ team: team._id, campaign: campaignId, status: "Finalized" });
            if (omps.length < 3) {
                allOmpsFinalized = false;
                missingOmps += (3 - omps.length);
            }
        }

        if (allOmpsFinalized) {
            report.ompsReady = true;
        } else {
            report.errors.push(`Missing or unfinalized OMPs detected (${missingOmps} total day-sheets missing across Mobile Teams).`);
        }
    }

    report.isReady = report.ucmpReady && report.ampsReady && report.ompsReady;
    return report;
};
