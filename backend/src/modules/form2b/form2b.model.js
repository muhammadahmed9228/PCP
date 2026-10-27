import mongoose from "mongoose";
import { CAMPAIGN_DAYS } from "../shared/campaignDays.js";

// --- Reusable Sub-Schemas ---

const missedChildrenSchema = new mongoose.Schema({
    notAvailable: {
        under1: { type: Number, default: 0 },
        oneToFive: { type: Number, default: 0 }
    },
    refusal: {
        under1: { type: Number, default: 0 },
        oneToFive: { type: Number, default: 0 }
    }
}, { _id: false });

const coveredMissedChildrenSchema = new mongoose.Schema({
    notAvailable: {
        under1: { type: Number, default: 0 },
        under5: { type: Number, default: 0 } // Matches 7.1.2 Under 5 years
    },
    refusal: {
        under1: { type: Number, default: 0 },
        oneToFive: { type: Number, default: 0 }
    }
}, { _id: false });

const logisticsSummarySchema = new mongoose.Schema({
    received: { type: Number, default: 0 },
    used: { type: Number, default: 0 },
    returned: { type: Number, default: 0 }
}, { _id: false });

const vitaminASummarySchema = new mongoose.Schema({
    received: { red: { type: Number, default: 0 }, blue: { type: Number, default: 0 } },
    used: { red: { type: Number, default: 0 }, blue: { type: Number, default: 0 } },
    returned: { red: { type: Number, default: 0 }, blue: { type: Number, default: 0 } }
}, { _id: false });

// --- Section 5: AIC-Wise Mobile Teams Daily Performance ---

const aicMobilePerformanceSchema = new mongoose.Schema({
    aic: { type: mongoose.Schema.Types.ObjectId, ref: "AIC" },
    area: { type: mongoose.Schema.Types.ObjectId, ref: "Area" },
    form2AId: { type: mongoose.Schema.Types.ObjectId, ref: "Form2A" },
    aicNo: { type: String, default: "N/A" },
    aicName: { type: String, required: true },
    areaName: { type: String },

    // 3. Total Households
    targetHouseholds: { type: Number, default: 0 }, // 3.1 From AMP / Form 2A
    visitedHouseholds: { type: Number, default: 0 }, // 3.2 Visited by teams

    // 4. Total Household Children from Microplan (Supports split OR combined Under 5)
    targetUnder1: { type: Number, default: 0 },      // 4.1 Under 1 year
    target1to5: { type: Number, default: 0 },        // 4.2 1-5 years
    targetTotalUnder5: { type: Number, default: 0 }, // 4.3 Under 5 years (combined)

    // 5. Total Vaccinated Children, Households First Visit
    vaccUnder1: { type: Number, default: 0 },        // 5.1 Vaccinated 0-1 year
    vacc1to5: { type: Number, default: 0 },          // 5.2 Vaccinated 1-5 years

    // 6 & 7. Missed & Same-Day Catch-up (To be populated by Catch-up module later)
    recordedMissed: { type: missedChildrenSchema, default: () => ({}) },
    coveredMissed: { type: coveredMissedChildrenSchema, default: () => ({}) },

    // 8 - 10. Other Vaccinations
    schoolVaccinated: { type: Number, default: 0 },
    guestVaccinated: { type: Number, default: 0 },
    streetVaccinated: { type: Number, default: 0 },

    // 11. Total MMP Children
    mmpTotal: { type: Number, default: 0 },
    mmpVaccinated: { type: Number, default: 0 },

    // 12 & 13. Zero & Locked Houses
    zeroHouses: { type: Number, default: 0 },
    lockHouses: { type: Number, default: 0 },

    // 14 & 15. Vaccines & Finger Markers
    vaccines: { type: logisticsSummarySchema, default: () => ({}) },
    markers: { type: logisticsSummarySchema, default: () => ({}) },

    // 16 & 17. AFP & Zero Dose RI
    afpCases: { type: Number, default: 0 },
    zeroDoseRI: { type: Number, default: 0 },

    // 18. Vitamin A Capsules
    vitaminA: { type: vitaminASummarySchema, default: () => ({}) }
}, { _id: false });

// --- Sections 6 & 7: AIC-Wise Fixed & Transit Daily Performance ---

const aicFixedTransitPerformanceSchema = new mongoose.Schema({
    aic: { type: mongoose.Schema.Types.ObjectId, ref: "AIC" },
    area: { type: mongoose.Schema.Types.ObjectId, ref: "Area" },
    form2AId: { type: mongoose.Schema.Types.ObjectId, ref: "Form2A" },
    aicNo: { type: String, default: "N/A" },
    aicName: { type: String, required: true },
    areaName: { type: String },

    // 3. Number of Children Vaccinated
    vaccinatedChildren: { type: Number, default: 0 },

    // 4. Vaccine Doses Record
    vaccines: { type: logisticsSummarySchema, default: () => ({}) },

    // 5. Vitamin A Capsules
    vitaminA: { type: vitaminASummarySchema, default: () => ({}) },

    // 6. Finger Markers
    markers: { type: logisticsSummarySchema, default: () => ({}) },

    // 7 & 8. AFP & Zero Dose RI
    afpCases: { type: Number, default: 0 },
    zeroDoseRI: { type: Number, default: 0 }
}, { _id: false });

// --- Main Form 2B Schema ---

const form2BSchema = new mongoose.Schema(
    {
        // Core Relational References
        campaign: { type: mongoose.Schema.Types.ObjectId, ref: "Campaign", required: true },
        uci: { type: mongoose.Schema.Types.ObjectId, ref: "UCI", required: true },
        campaignDay: { type: Number, enum: CAMPAIGN_DAYS, required: true },
        status: { type: String, enum: ["Draft", "Finalized"], default: "Draft" },

        // Audit Trail for Finalization & Reopening
        finalizedAt: { type: Date },
        reopenedBy: { type: mongoose.Schema.Types.ObjectId, ref: "UCI" },
        reopenedAt: { type: Date },
        reopenReason: { type: String, trim: true, maxlength: 500 },

        // Sections 1 - 3: Auto-Populated Snapshot (Campaign, UCI, UC Geography)
        snapshot: {
            campaignName: String,
            sia: String,
            uciName: String,
            uciNo: String,
            province: String,
            district: String,
            tehsil: String,
            ucName: String,
            ucNo: String
        },

        // Section 4: AICs & Field Teams Detail (Auto-populated)
        reportingSummary: {
            totalAicsReported: { type: Number, default: 0 },
            totalMobileTeams: { type: Number, default: 0 },
            totalFixedTeams: { type: Number, default: 0 },
            totalTransitTeams: { type: Number, default: 0 },
            totalFieldTeamsReported: { type: Number, default: 0 } // Mobile + Fixed + Transit
        },

        // Section 5: Mobile Teams Performance (One entry per AIC + UC-wide collective total)
        aicMobilePerformances: [aicMobilePerformanceSchema],
        ucMobileTotals: { type: aicMobilePerformanceSchema, default: () => ({ aicName: "UC TOTAL" }) },

        // Section 6: Fixed Teams Performance (One entry per AIC + UC-wide collective total)
        aicFixedPerformances: [aicFixedTransitPerformanceSchema],
        ucFixedTotals: { type: aicFixedTransitPerformanceSchema, default: () => ({ aicName: "UC TOTAL" }) },

        // Section 7: Transit Teams Performance (One entry per AIC + UC-wide collective total)
        aicTransitPerformances: [aicFixedTransitPerformanceSchema],
        ucTransitTotals: { type: aicFixedTransitPerformanceSchema, default: () => ({ aicName: "UC TOTAL" }) },

        // Section 8: Daily Inventory Summary (Auto-calculated across all AICs)
        dailyInventorySummary: {
            byTeamType: {
                mobile: {
                    vaccines: { type: logisticsSummarySchema, default: () => ({}) },
                    markers: { type: logisticsSummarySchema, default: () => ({}) }
                },
                fixed: {
                    vaccines: { type: logisticsSummarySchema, default: () => ({}) },
                    markers: { type: logisticsSummarySchema, default: () => ({}) }
                },
                transit: {
                    vaccines: { type: logisticsSummarySchema, default: () => ({}) },
                    markers: { type: logisticsSummarySchema, default: () => ({}) }
                }
            },
            grandTotalVaccines: { type: logisticsSummarySchema, default: () => ({}) },
            grandTotalMarkers: { type: logisticsSummarySchema, default: () => ({}) }
        }
    },
    { timestamps: true, minimize: false }
);

// Prevent duplicate Form 2B documents for the same UCI, Campaign, and Day
form2BSchema.index({ campaign: 1, uci: 1, campaignDay: 1 }, { unique: true });

export const Form2B = mongoose.model("Form2B", form2BSchema);
