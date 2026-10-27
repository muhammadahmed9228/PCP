import { Form2B } from "./form2b.model.js";
import { Form2A } from "../form2a/form2a.model.js";
import { Campaign } from "../campaigns/campaign.model.js";
import { UCI } from "../users/uci.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { validateReopenReason } from "../../utils/reopenReason.js";
import { assertForm2BReadyToFinalize } from "../completion/completion.service.js";
import { withMongoTransaction } from "../../utils/mongoTransaction.js";

const withSession = (query, session) => (session ? query.session(session) : query);

// --- Helper: Sum Vitamin A objects safely ---
const createEmptyVitA = () => ({
    received: { red: 0, blue: 0 },
    used: { red: 0, blue: 0 },
    returned: { red: 0, blue: 0 }
});

const addVitA = (target, source) => {
    if (!source) return target;
    target.received.red += source.received?.red || 0;
    target.received.blue += source.received?.blue || 0;
    target.used.red += source.used?.red || 0;
    target.used.blue += source.used?.blue || 0;
    target.returned.red += source.returned?.red || 0;
    target.returned.blue += source.returned?.blue || 0;
    return target;
};

// --- Helper: Sum Logistics (Received, Used, Returned) safely ---
const createEmptyLogistics = () => ({ received: 0, used: 0, returned: 0 });

const addLogistics = (target, source) => {
    if (!source) return target;
    target.received += source.received || 0;
    target.used += source.used || 0;
    target.returned += source.returned || 0;
    return target;
};

// --- Helper: Roll up an array of Mobile performances (from Form 2A or across AICs) ---
const rollUpMobileRows = (rows, label = "UC TOTAL") => {
    const total = {
        aicName: label,
        aicNo: "-",
        targetHouseholds: 0,
        visitedHouseholds: 0,
        targetUnder1: 0,
        target1to5: 0,
        targetTotalUnder5: 0,
        vaccUnder1: 0,
        vacc1to5: 0,
        recordedMissed: { notAvailable: { under1: 0, oneToFive: 0 }, refusal: { under1: 0, oneToFive: 0 } },
        coveredMissed: { notAvailable: { under1: 0, under5: 0 }, refusal: { under1: 0, oneToFive: 0 } },
        schoolVaccinated: 0,
        guestVaccinated: 0,
        streetVaccinated: 0,
        mmpTotal: 0,
        mmpVaccinated: 0,
        zeroHouses: 0,
        lockHouses: 0,
        vaccines: createEmptyLogistics(),
        markers: createEmptyLogistics(),
        afpCases: 0,
        zeroDoseRI: 0,
        vitaminA: createEmptyVitA()
    };

    rows.forEach(r => {
        total.targetHouseholds += r.targetHouseholds || 0;
        total.visitedHouseholds += r.visitedHouseholds || 0;

        const u1 = r.targetUnder1 ?? r.ompChildrenUnder1 ?? 0;
        const o15 = r.target1to5 ?? r.ompChildren1to5 ?? 0;
        const u5 = r.targetTotalUnder5 || (u1 + o15);

        total.targetUnder1 += u1;
        total.target1to5 += o15;
        total.targetTotalUnder5 += u5;

        total.vaccUnder1 += r.vaccUnder1 || 0;
        total.vacc1to5 += r.vacc1to5 || 0;

        // Missed Children (6)
        total.recordedMissed.notAvailable.under1 += r.recordedMissed?.notAvailable?.under1 || 0;
        total.recordedMissed.notAvailable.oneToFive += r.recordedMissed?.notAvailable?.oneToFive || 0;
        total.recordedMissed.refusal.under1 += r.recordedMissed?.refusal?.under1 || 0;
        total.recordedMissed.refusal.oneToFive += r.recordedMissed?.refusal?.oneToFive || 0;

        // Covered Missed Children (7)
        total.coveredMissed.notAvailable.under1 += r.coveredMissed?.notAvailable?.under1 || 0;
        total.coveredMissed.notAvailable.under5 += (r.coveredMissed?.notAvailable?.under5 ?? r.coveredMissed?.notAvailable?.oneToFive ?? 0);
        total.coveredMissed.refusal.under1 += r.coveredMissed?.refusal?.under1 || 0;
        total.coveredMissed.refusal.oneToFive += r.coveredMissed?.refusal?.oneToFive || 0;

        total.schoolVaccinated += r.schoolVaccinated || 0;
        total.guestVaccinated += r.guestVaccinated || 0;
        total.streetVaccinated += r.streetVaccinated || 0;
        total.mmpTotal += r.mmpTotal || 0;
        total.mmpVaccinated += r.mmpVaccinated || 0;
        total.zeroHouses += r.zeroHouses || 0;
        total.lockHouses += r.lockHouses || 0;

        addLogistics(total.vaccines, r.vaccines);
        addLogistics(total.markers, r.markers);

        total.afpCases += r.afpCases || 0;
        total.zeroDoseRI += r.zeroDoseRI || 0;

        addVitA(total.vitaminA, r.vitaminA);
    });

    return total;
};

// --- Helper: Roll up Fixed or Transit performances (from Form 2A or across AICs) ---
const rollUpFixedTransitRows = (rows, label = "UC TOTAL") => {
    const total = {
        aicName: label,
        aicNo: "-",
        vaccinatedChildren: 0,
        vaccines: createEmptyLogistics(),
        vitaminA: createEmptyVitA(),
        markers: createEmptyLogistics(),
        afpCases: 0,
        zeroDoseRI: 0
    };

    rows.forEach(r => {
        total.vaccinatedChildren += r.vaccinatedChildren || 0;
        addLogistics(total.vaccines, r.vaccines);
        addVitA(total.vitaminA, r.vitaminA);
        addLogistics(total.markers, r.markers);
        total.afpCases += r.afpCases || 0;
        total.zeroDoseRI += r.zeroDoseRI || 0;
    });

    return total;
};

// --- Primary Service: Generate or Update Form 2B Draft ---
export const generateOrUpdateForm2BDraft = async (campaignId, campaignDay, uciId, session = null) => {
    // 1. Validate Campaign & UCI ownership
    const campaign = await withSession(Campaign.findOne({ _id: campaignId, uci: uciId }), session);
    if (!campaign) {
        throw new ApiError(404, "Campaign not found or unauthorized.");
    }

    const uci = await withSession(UCI.findById(uciId), session);
    if (!uci) throw new ApiError(404, "UCI profile not found.");

    // 2. If already Finalized, return locked document without overwriting
    let existingForm2B = await withSession(Form2B.findOne({ campaign: campaignId, uci: uciId, campaignDay }), session);
    if (existingForm2B && existingForm2B.status === "Finalized") {
        return existingForm2B;
    }

    // Completed campaigns are historical and may only expose an already-finalized
    // Form 2B. They must never generate or overwrite a draft.
    if (campaign.status !== "Active") {
        throw new ApiError(400, "Form 2B can only be generated when the Campaign is 'Active'.");
    }

    // 3. Query all Finalized Form 2As for this UCI, Campaign, and Day
    const finalizedForm2As = await withSession(Form2A.find({
        campaign: campaignId,
        uci: uciId,
        campaignDay,
        status: "Finalized"
    }), session);

    // 4. Aggregate Section 4: Team & AIC Counts
    let totalMobileTeams = 0;
    let totalFixedTeams = 0;
    let totalTransitTeams = 0;

    // 5. Build AIC-wise rows for Sections 5, 6, and 7
    const aicMobilePerformances = [];
    const aicFixedPerformances = [];
    const aicTransitPerformances = [];

    finalizedForm2As.forEach(f2a => {
        totalMobileTeams += f2a.teamCounts?.totalMobile || 0;
        totalFixedTeams += f2a.teamCounts?.totalFixed || 0;
        totalTransitTeams += f2a.teamCounts?.totalTransit || 0;

        // Roll up all mobile teams of this AIC into a single AIC row for Section 5
        const aicMobileSum = rollUpMobileRows(f2a.mobilePerformances || [], f2a.snapshot?.aicName);
        aicMobilePerformances.push({
            ...aicMobileSum,
            aic: f2a.aic,
            area: f2a.area,
            form2AId: f2a._id,
            aicNo: f2a.snapshot?.aicNo || "N/A",
            aicName: f2a.snapshot?.aicName || "Unknown AIC",
            areaName: f2a.snapshot?.areaName || ""
        });

        // Roll up all fixed teams of this AIC into a single AIC row for Section 6
        const aicFixedSum = rollUpFixedTransitRows(f2a.fixedPerformances || [], f2a.snapshot?.aicName);
        aicFixedPerformances.push({
            ...aicFixedSum,
            aic: f2a.aic,
            area: f2a.area,
            form2AId: f2a._id,
            aicNo: f2a.snapshot?.aicNo || "N/A",
            aicName: f2a.snapshot?.aicName || "Unknown AIC",
            areaName: f2a.snapshot?.areaName || ""
        });

        // Roll up all transit teams of this AIC into a single AIC row for Section 7
        const aicTransitSum = rollUpFixedTransitRows(f2a.transitPerformances || [], f2a.snapshot?.aicName);
        aicTransitPerformances.push({
            ...aicTransitSum,
            aic: f2a.aic,
            area: f2a.area,
            form2AId: f2a._id,
            aicNo: f2a.snapshot?.aicNo || "N/A",
            aicName: f2a.snapshot?.aicName || "Unknown AIC",
            areaName: f2a.snapshot?.areaName || ""
        });
    });

    // 6. Compute UC-Wide Collective Totals for Sections 5, 6, and 7
    const ucMobileTotals = rollUpMobileRows(aicMobilePerformances, "ALL AICs TOTAL");
    const ucFixedTotals = rollUpFixedTransitRows(aicFixedPerformances, "ALL AICs TOTAL");
    const ucTransitTotals = rollUpFixedTransitRows(aicTransitPerformances, "ALL AICs TOTAL");

    // 7. Compute Section 8: Daily Inventory Summary across all AICs
    const mobileVacc = ucMobileTotals.vaccines;
    const fixedVacc = ucFixedTotals.vaccines;
    const transitVacc = ucTransitTotals.vaccines;

    const mobileMark = ucMobileTotals.markers;
    const fixedMark = ucFixedTotals.markers;
    const transitMark = ucTransitTotals.markers;

    const dailyInventorySummary = {
        byTeamType: {
            mobile: { vaccines: mobileVacc, markers: mobileMark },
            fixed: { vaccines: fixedVacc, markers: fixedMark },
            transit: { vaccines: transitVacc, markers: transitMark }
        },
        grandTotalVaccines: {
            received: mobileVacc.received + fixedVacc.received + transitVacc.received,
            used: mobileVacc.used + fixedVacc.used + transitVacc.used,
            returned: mobileVacc.returned + fixedVacc.returned + transitVacc.returned
        },
        grandTotalMarkers: {
            received: mobileMark.received + fixedMark.received + transitMark.received,
            used: mobileMark.used + fixedMark.used + transitMark.used,
            returned: mobileMark.returned + fixedMark.returned + transitMark.returned
        }
    };

    // 8. Construct Payload
    const dataToSave = {
        campaign: campaign._id,
        uci: uci._id,
        campaignDay,
        status: "Draft",
        snapshot: {
            campaignName: campaign.campaignName,
            sia: campaign.nameOfSIA,
            uciName: uci.uciName,
            uciNo: uci.uciNo,
            province: uci.province || "N/A",
            district: uci.district || "N/A",
            tehsil: uci.townTehsil || "N/A",
            ucName: uci.ucName,
            ucNo: uci.ucNumber
        },
        reportingSummary: {
            totalAicsReported: finalizedForm2As.length,
            totalMobileTeams,
            totalFixedTeams,
            totalTransitTeams,
            totalFieldTeamsReported: totalMobileTeams + totalFixedTeams + totalTransitTeams
        },
        aicMobilePerformances,
        ucMobileTotals,
        aicFixedPerformances,
        ucFixedTotals,
        aicTransitPerformances,
        ucTransitTotals,
        dailyInventorySummary
    };

    if (existingForm2B) {
        existingForm2B = await Form2B.findByIdAndUpdate(existingForm2B._id, dataToSave, { new: true, session });
    } else {
        if (session) {
            [existingForm2B] = await Form2B.create([dataToSave], { session });
        } else {
            existingForm2B = await Form2B.create(dataToSave);
        }
    }

    return existingForm2B;
};

export const refreshDraftForm2B = async (campaignId, campaignDay, uciId, session = null) => {
    const form2B = await withSession(
        Form2B.findOne({ campaign: campaignId, uci: uciId, campaignDay }),
        session
    );

    if (!form2B || form2B.status !== "Draft") return form2B;
    return generateOrUpdateForm2BDraft(campaignId, campaignDay, uciId, session);
};

// --- Finalize Form 2B ---
export const finalizeForm2B = async (campaignId, campaignDay, uciId, session = null) => {
    if (!session) {
        return withMongoTransaction((transactionSession) =>
            finalizeForm2B(campaignId, campaignDay, uciId, transactionSession)
        );
    }

    const campaign = await Campaign.findOne({ _id: campaignId, uci: uciId }).session(session);
    if (!campaign) throw new ApiError(404, "Campaign not found or unauthorized.");
    if (campaign.status !== "Active") throw new ApiError(403, "Completed or inactive campaigns are read-only.");

    const form2B = await Form2B.findOne({ campaign: campaignId, uci: uciId, campaignDay }).session(session);
    if (!form2B) throw new ApiError(404, "Form 2B draft not found. Please generate it first.");
    if (form2B.status === "Finalized") throw new ApiError(400, "Form 2B is already finalized.");

    if (form2B.reportingSummary.totalAicsReported === 0) {
        throw new ApiError(400, "Cannot finalize Form 2B: Zero AICs have finalized their Form 2A for this day.");
    }

    await assertForm2BReadyToFinalize(form2B, session);

    form2B.status = "Finalized";
    form2B.finalizedAt = new Date();
    await form2B.save({ session });

    return form2B;
};

// --- Authorized Reopening (Form 2B or an AIC's Form 2A) ---
export const reopenForm2B = async (campaignId, campaignDay, uciId, reason) => {
    const normalizedReason = validateReopenReason(reason);
    const campaign = await Campaign.findOne({ _id: campaignId, uci: uciId });
    if (!campaign) throw new ApiError(404, "Campaign not found or unauthorized.");
    if (campaign.status === "Completed") throw new ApiError(403, "Completed campaigns are read-only.");
    const form2B = await Form2B.findOne({ campaign: campaignId, uci: uciId, campaignDay });
    if (!form2B) throw new ApiError(404, "Form 2B not found.");
    if (form2B.status !== "Finalized") throw new ApiError(400, "Form 2B is already in Draft status.");

    form2B.status = "Draft";
    form2B.reopenedBy = uciId;
    form2B.reopenedAt = new Date();
    form2B.reopenReason = normalizedReason;
    form2B.finalizedAt = undefined;
    await form2B.save();

    return form2B;
};
