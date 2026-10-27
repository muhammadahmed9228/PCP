import mongoose from "mongoose";
import { ApiError } from "../../utils/ApiError.js";
import { CAMPAIGN_DAYS } from "../shared/campaignDays.js";

// --- Sub-Schemas for Team Performances ---

const missedChildrenSchema = new mongoose.Schema({
    notAvailable: { under1: { type: Number, default: 0 }, oneToFive: { type: Number, default: 0 } },
    refusal: { under1: { type: Number, default: 0 }, oneToFive: { type: Number, default: 0 } }
}, { _id: false });

const coveredMissedChildrenSchema = new mongoose.Schema({
    notAvailable: { under1: { type: Number, default: 0 }, under5: { type: Number, default: 0 } },
    refusal: { under1: { type: Number, default: 0 }, oneToFive: { type: Number, default: 0 } }
}, { _id: false });

const logisticsSummarySchema = new mongoose.Schema({
    received: { type: Number, default: 0 },
    used: { type: Number, default: 0 },
    returned: { type: Number, default: 0 }
}, { _id: false });

const mobileTeamPerformanceSchema = new mongoose.Schema({
    team: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
    teamNo: String, leaderName: String, memberName: String,
    
    // 3. Households
    targetHouseholds: { type: Number, default: 0 }, // From OMP
    visitedHouseholds: { type: Number, default: 0 }, // From Tally
    
    // 4. Total Children (From OMP)
    ompChildrenUnder1: { type: Number, default: 0 },
    ompChildren1to5: { type: Number, default: 0 },
    
    // 5. Vaccinated (From Tally)
    vaccUnder1: { type: Number, default: 0 },
    vacc1to5: { type: Number, default: 0 },
    
    // 6 & 7. Missed and Catch-up (Placeholders for future Catch-up workflow)
    recordedMissed: { type: missedChildrenSchema, default: () => ({}) },
    coveredMissed: { type: coveredMissedChildrenSchema, default: () => ({}) },
    
    // 8 - 13. Demographics and Categories
    schoolVaccinated: { type: Number, default: 0 },
    guestVaccinated: { type: Number, default: 0 },
    streetVaccinated: { type: Number, default: 0 },
    mmpTotal: { type: Number, default: 0 },
    mmpVaccinated: { type: Number, default: 0 },
    zeroHouses: { type: Number, default: 0 },
    lockHouses: { type: Number, default: 0 },
    
    // 14 - 18. Inventory & Cases
    vaccines: { type: logisticsSummarySchema, default: () => ({}) },
    markers: { type: logisticsSummarySchema, default: () => ({}) },
    afpCases: { type: Number, default: 0 },
    zeroDoseRI: { type: Number, default: 0 },
    vitaminA: {
        received: { red: { type: Number, default: 0 }, blue: { type: Number, default: 0 } },
        used: { red: { type: Number, default: 0 }, blue: { type: Number, default: 0 } },
        returned: { red: { type: Number, default: 0 }, blue: { type: Number, default: 0 } }
    }
}, { _id: false });

const fixedTransitPerformanceSchema = new mongoose.Schema({
    team: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
    teamNo: String, leaderName: String, memberName: String,
    
    // 3. Vaccinated
    vaccinatedChildren: { type: Number, default: 0 },
    
    // 4 - 8. Inventory & Cases
    vaccines: { type: logisticsSummarySchema, default: () => ({}) },
    markers: { type: logisticsSummarySchema, default: () => ({}) },
    vitaminA: {
        received: { red: { type: Number, default: 0 }, blue: { type: Number, default: 0 } },
        used: { red: { type: Number, default: 0 }, blue: { type: Number, default: 0 } },
        returned: { red: { type: Number, default: 0 }, blue: { type: Number, default: 0 } }
    },
    afpCases: { type: Number, default: 0 },
    zeroDoseRI: { type: Number, default: 0 }
}, { _id: false });

// --- Main Form 2A Schema ---

const form2ASchema = new mongoose.Schema(
    {
        // Relational References
        campaign: { type: mongoose.Schema.Types.ObjectId, ref: "Campaign", required: true },
        area: { type: mongoose.Schema.Types.ObjectId, ref: "Area", required: true },
        uci: { type: mongoose.Schema.Types.ObjectId, ref: "UCI", required: true },
        aic: { type: mongoose.Schema.Types.ObjectId, ref: "AIC", required: true },
        campaignDay: { type: Number, enum: CAMPAIGN_DAYS, required: true },
        status: { type: String, enum: ["Draft", "Finalized"], default: "Draft" },
        finalizedAt: { type: Date },
        reopenedBy: { type: mongoose.Schema.Types.ObjectId, ref: "UCI" },
        reopenReason: { type: String, trim: true, maxlength: 500 },
        reopenedAt: { type: Date },

        // Sections 1-3: Snapshot Auto-populated Info
        snapshot: {
            campaignName: String, sia: String,
            uciName: String, uciNo: String,
            aicName: String, aicNo: String,
            province: String, district: String, tehsil: String,
            ucName: String, ucNo: String,
            areaName: String, areaNo: String
        },

        // Section 4: Team Counts (Reporting for this day)
        teamCounts: {
            totalMobile: { type: Number, default: 0 },
            totalFixed: { type: Number, default: 0 },
            totalTransit: { type: Number, default: 0 }
        },

        // Section 5, 6, 7: Arrays containing performance for each team type
        mobilePerformances: [mobileTeamPerformanceSchema],
        fixedPerformances: [fixedTransitPerformanceSchema],
        transitPerformances: [fixedTransitPerformanceSchema],

        // Aggregated Mobile Totals (Summing fields 3-18 collectively for UCI Form 2B)
        aggregatedMobileTotals: { type: Object, default: {} },
        // Aggregated Fixed Totals
        aggregatedFixedTotals: { type: Object, default: {} },
        // Aggregated Transit Totals
        aggregatedTransitTotals: { type: Object, default: {} },

        // Section 8: Daily Collective Inventory
        collectiveInventory: {
            vaccines: {
                mobile: { type: logisticsSummarySchema, default: () => ({}) },
                fixed: { type: logisticsSummarySchema, default: () => ({}) },
                transit: { type: logisticsSummarySchema, default: () => ({}) },
                dailyTotal: { type: logisticsSummarySchema, default: () => ({}) }
            },
            markers: {
                mobile: { type: logisticsSummarySchema, default: () => ({}) },
                fixed: { type: logisticsSummarySchema, default: () => ({}) },
                transit: { type: logisticsSummarySchema, default: () => ({}) },
                dailyTotal: { type: logisticsSummarySchema, default: () => ({}) }
            }
        }
    },
    { timestamps: true, minimize: false } // minimize:false prevents empty objects from being stripped
);

// Prevent duplicate Form 2As for the same Area and Day
form2ASchema.index({ campaign: 1, area: 1, campaignDay: 1 }, { unique: true });

export const Form2A = mongoose.model("Form2A", form2ASchema);
