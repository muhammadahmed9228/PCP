import { Form2A } from "./form2a.model.js";
import { Area } from "../areas/area.model.js";
import { Campaign } from "../campaigns/campaign.model.js";
import { UCI } from "../users/uci.model.js";
import { AIC } from "../users/aic.model.js";
import { TallySheet } from "../tallySheet/tallySheet.model.js";
import { FixedSheet } from "../fixedSheet/fixedSheet.model.js";
import { TransitSheet } from "../transitSheet/transitSheet.model.js";
import { OMP } from "../omp/omp.model.js";
import { ApiError } from "../../utils/ApiError.js";

// Helper function to sum logistics objects
const sumLogistics = (sheets, fieldPath) => {
    return sheets.reduce((acc, sheet) => {
        const data = sheet.logistics?.[fieldPath] || {};
        acc.received += (data.received?.sealPacked || 0) + (data.received?.partiallyUsed || data.received || 0); // Handles markers (flat) and vaccines (nested)
        acc.used += (data.used?.sealPacked || 0) + (data.used?.partiallyUsed || data.used || 0);
        acc.returned += (data.returned?.sealPacked || 0) + (data.returned?.partiallyUsed || data.returned || 0);
        return acc;
    }, { received: 0, used: 0, returned: 0 });
};

export const generateOrUpdateForm2ADraft = async (areaId, campaignDay, aicId) => {
    // 1. Authorization and Hierarchy
    const area = await Area.findById(areaId);
    if (!area || area.aic.toString() !== aicId.toString()) {
        throw new ApiError(403, "Unauthorized access to this Area.");
    }
    const campaign = await Campaign.findById(area.campaign);
    if (campaign.status !== "Active") {
        throw new ApiError(400, "Campaign is not Active.");
    }
    const uci = await UCI.findById(area.uci);
    const aic = await AIC.findById(area.aic);

    // 2. Prevent update if already Finalized
    let form2A = await Form2A.findOne({ area: areaId, campaignDay });
    if (form2A && form2A.status === "Finalized") {
        return form2A; // Return existing locked document
    }

    // 3. Fetch all Finalized data for this Area & Day
    const omps = await OMP.find({ area: areaId, campaignDay, status: "Finalized" });
    const tallySheets = await TallySheet.find({ area: areaId, campaignDay, status: "Finalized" });
    const fixedSheets = await FixedSheet.find({ area: areaId, campaignDay, status: "Finalized" });
    const transitSheets = await TransitSheet.find({ area: areaId, campaignDay, status: "Finalized" });

    // 4. Construct Section 5: Mobile Performances
    const mobilePerformances = tallySheets.map(tally => {
        const omp = omps.find(o => o.team.toString() === tally.team.toString());
        return {
            team: tally.team,
            teamNo: tally.snapshot.teamNo,
            leaderName: tally.snapshot.teamLeaderName,
            memberName: tally.snapshot.teamMemberName,
            targetHouseholds: omp?.totalHouseholds || 0,
            visitedHouseholds: tally.households?.length || 0,
            ompChildrenUnder1: omp?.totalUnder1Year || 0,
            ompChildren1to5: omp?.total1to5Years || 0,
            vaccUnder1: tally.summary.vacc0to1 || 0,
            vacc1to5: tally.summary.vacc1to5 || 0,
            //new
            recordedMissed: tally.summary.recordedMissed || {
                notAvailable: { under1: 0, oneToFive: 0 },
                refusal: { under1: 0, oneToFive: 0 }
            },
            coveredMissed: tally.summary.coveredMissed || {
                notAvailable: { under1: 0, under5: 0 },
                refusal: { under1: 0, oneToFive: 0 }
            },
            schoolVaccinated: tally.summary.schoolVaccTotal || 0,
            guestVaccinated: tally.summary.guestVaccTotal || 0,
            streetVaccinated: tally.summary.streetVaccTotal || 0,
            mmpTotal: tally.summary.mmpTotalChildren || 0,
            mmpVaccinated: tally.summary.mmpVaccTotal || 0,
            zeroHouses: tally.summary.zeroHousesTotal || 0,
            lockHouses: tally.summary.lockHousesTotal || 0,
            vaccines: {
                received: (tally.logistics?.vaccines?.received?.sealPacked || 0) + (tally.logistics?.vaccines?.received?.partiallyUsed || 0),
                used: (tally.logistics?.vaccines?.used?.sealPacked || 0) + (tally.logistics?.vaccines?.used?.partiallyUsed || 0),
                returned: (tally.logistics?.vaccines?.returned?.sealPacked || 0) + (tally.logistics?.vaccines?.returned?.partiallyUsed || 0)
            },
            markers: tally.logistics?.markers || { received: 0, used: 0, returned: 0 },
            afpCases: tally.afpCasesNoticed || 0,
            zeroDoseRI: tally.zeroDoseRIRecorded || 0,
            vitaminA: tally.logistics?.capsules || {}
        };
    });

    // 5. Construct Sections 6 & 7: Fixed and Transit
    const mapFixedTransit = (sheets) => sheets.map(sheet => ({
        team: sheet.team,
        teamNo: sheet.snapshot.teamNo,
        leaderName: sheet.snapshot.teamLeaderName,
        memberName: sheet.snapshot.teamMemberName,
        vaccinatedChildren: sheet.summary?.totalVaccinated || 0,
        vaccines: {
            received: (sheet.logistics?.vaccines?.received?.sealPacked || 0) + (sheet.logistics?.vaccines?.received?.partiallyUsed || 0),
            used: (sheet.logistics?.vaccines?.used?.sealPacked || 0) + (sheet.logistics?.vaccines?.used?.partiallyUsed || 0),
            returned: (sheet.logistics?.vaccines?.returned?.sealPacked || 0) + (sheet.logistics?.vaccines?.returned?.partiallyUsed || 0)
        },
        markers: sheet.logistics?.markers || { received: 0, used: 0, returned: 0 },
        vitaminA: sheet.logistics?.capsules || {},
        afpCases: sheet.afpCasesNoticed || 0,
        zeroDoseRI: sheet.zeroDoseRIRecorded || 0
    }));

    const fixedPerformances = mapFixedTransit(fixedSheets);
    const transitPerformances = mapFixedTransit(transitSheets);

    // 6. Calculate Section 8: Daily Collective Inventory
    const mobVacc = sumLogistics(tallySheets, "vaccines");
    const fixVacc = sumLogistics(fixedSheets, "vaccines");
    const transVacc = sumLogistics(transitSheets, "vaccines");

    const mobMark = sumLogistics(tallySheets, "markers");
    const fixMark = sumLogistics(fixedSheets, "markers");
    const transMark = sumLogistics(transitSheets, "markers");

    const collectiveInventory = {
        vaccines: {
            mobile: mobVacc, fixed: fixVacc, transit: transVacc,
            dailyTotal: {
                received: mobVacc.received + fixVacc.received + transVacc.received,
                used: mobVacc.used + fixVacc.used + transVacc.used,
                returned: mobVacc.returned + fixVacc.returned + transVacc.returned
            }
        },
        markers: {
            mobile: mobMark, fixed: fixMark, transit: transMark,
            dailyTotal: {
                received: mobMark.received + fixMark.received + transMark.received,
                used: mobMark.used + fixMark.used + transMark.used,
                returned: mobMark.returned + fixMark.returned + transMark.returned
            }
        }
    };

    // 7. Aggregate Subtotals for Form 2B (Math mapping)
    const aggregatedMobileTotals = mobilePerformances.reduce((acc, curr) => {
        for (let key in curr) {
            if (typeof curr[key] === "number") {
                acc[key] = (acc[key] || 0) + curr[key];
            }
        }
        // Deep-sum Field 6 (Recorded Missed)
        acc.recordedMissed.notAvailable.under1 += curr.recordedMissed?.notAvailable?.under1 || 0;
        acc.recordedMissed.notAvailable.oneToFive += curr.recordedMissed?.notAvailable?.oneToFive || 0;
        acc.recordedMissed.refusal.under1 += curr.recordedMissed?.refusal?.under1 || 0;
        acc.recordedMissed.refusal.oneToFive += curr.recordedMissed?.refusal?.oneToFive || 0;

        // Deep-sum Field 7 (Covered Missed)
        acc.coveredMissed.notAvailable.under1 += curr.coveredMissed?.notAvailable?.under1 || 0;
        acc.coveredMissed.notAvailable.under5 += curr.coveredMissed?.notAvailable?.under5 || 0;
        acc.coveredMissed.refusal.under1 += curr.coveredMissed?.refusal?.under1 || 0;
        acc.coveredMissed.refusal.oneToFive += curr.coveredMissed?.refusal?.oneToFive || 0;

        return acc;
    }, {
        recordedMissed: { notAvailable: { under1: 0, oneToFive: 0 }, refusal: { under1: 0, oneToFive: 0 } },
        coveredMissed: { notAvailable: { under1: 0, under5: 0 }, refusal: { under1: 0, oneToFive: 0 } }
    });

    const aggregatedFixedTotals = fixedPerformances.reduce((acc, curr) => {
        acc.vaccinatedChildren = (acc.vaccinatedChildren || 0) + (Number(curr.vaccinatedChildren) || 0);
        return acc;
    }, { vaccinatedChildren: 0 });

    const aggregatedTransitTotals = transitPerformances.reduce((acc, curr) => {
        acc.vaccinatedChildren = (acc.vaccinatedChildren || 0) + (Number(curr.vaccinatedChildren) || 0);
        return acc;
    }, { vaccinatedChildren: 0 });

    // 8. Prepare Document
    const dataToSave = {
        campaign: campaign._id, area: area._id, uci: uci._id, aic: aic._id,
        campaignDay, status: "Draft",
        snapshot: {
            campaignName: campaign.campaignName, sia: campaign.nameOfSIA,
            uciName: uci.uciName, uciNo: uci.uciNo,
            aicName: aic.aicName, aicNo: aic.phoneNumber,
            province: uci.province || "N/A", district: uci.district || "N/A",
            tehsil: uci.townTehsil || "N/A", ucName: uci.ucName, ucNo: uci.ucNumber,
            areaName: area.areaName, areaNo: area.areaNo
        },
        teamCounts: {
            totalMobile: tallySheets.length,
            totalFixed: fixedSheets.length,
            totalTransit: transitSheets.length
        },
        mobilePerformances,
        fixedPerformances,
        transitPerformances,
        aggregatedMobileTotals,
        aggregatedFixedTotals,
        aggregatedTransitTotals,
        collectiveInventory
    };

    if (form2A) {
        form2A = await Form2A.findByIdAndUpdate(form2A._id, dataToSave, { new: true });
    } else {
        form2A = await Form2A.create(dataToSave);
    }

    return form2A;
};

export const finalizeForm2A = async (areaId, campaignDay, aicId) => {
    const form2A = await Form2A.findOne({ area: areaId, campaignDay, aic: aicId });
    if (!form2A) throw new ApiError(404, "Form 2A Draft not found. Generate it first.");
    if (form2A.status === "Finalized") throw new ApiError(400, "Form 2A is already finalized.");

    // (Optional enhancement: Validate that total expected teams matches reporting teams before locking)

    form2A.status = "Finalized";
    await form2A.save();
    return form2A;
};