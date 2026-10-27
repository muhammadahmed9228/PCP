import mongoose from "mongoose";
import { ApiError } from "../../utils/ApiError.js";
import { validateLogisticsConservation } from "../shared/sheetInvariants.js";

// --- Sub-Schemas ---
const vaccinatedChildSchema = new mongoose.Schema({
    childName: { type: String, required: true },
    age: { type: String, required: true },
    fatherName: { type: String, required: true },
    address: { type: String, required: true }
}, { _id: false });

const unvaccinatedChildSchema = new mongoose.Schema({
    childName: { type: String, required: true },
    fatherName: { type: String, required: true },
    age: { type: String, required: true },
    address: { type: String, required: true },
    phoneNo: { type: String }
}, { _id: false });

const weaknessParalysisSchema = new mongoose.Schema({
    childName: { type: String, required: true },
    fatherName: { type: String, required: true },
    age: { type: String, required: true },
    dateDiagnosed: { type: Date, required: true },
    address: { type: String, required: true },
    phoneNo: { type: String }
}, { _id: false });

// --- Main Schema ---
const fixedSheetSchema = new mongoose.Schema(
    {
        // Relational References
        campaign: { type: mongoose.Schema.Types.ObjectId, ref: "Campaign", required: true },
        area: { type: mongoose.Schema.Types.ObjectId, ref: "Area", required: true },
        uci: { type: mongoose.Schema.Types.ObjectId, ref: "UCI", required: true },
        aic: { type: mongoose.Schema.Types.ObjectId, ref: "AIC", required: true },
        point: { type: mongoose.Schema.Types.ObjectId, ref: "Point", required: true },
        team: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
        campaignDay: { type: Number, required: true, min: 1, max: 7 },
        status: { type: String, enum: ["Draft", "Finalized"], default: "Draft" },
        finalizedAt: { type: Date },
        reopenedBy: { type: mongoose.Schema.Types.ObjectId, ref: "AIC" },
        reopenReason: { type: String, trim: true, maxlength: 500 },
        reopenedAt: { type: Date },

        // Sections 1-4: Snapshot Auto-populated Info
        snapshot: {
            campaignName: String, sia: String, sid: String,
            uciName: String, uciNo: String,
            aicName: String, aicNo: String,
            province: String, district: String, tehsil: String,
            ucName: String, ucNo: String,
            areaName: String, areaNo: String,
            fixedPointName: String, fixedPointNumber: String,
            teamNo: String, teamLeaderName: String, teamMemberName: String
        },

        // Section 5: Vaccination Details
        vaccinatedChildren: {
            type: [vaccinatedChildSchema],
            validate: [arr => arr.length <= 60, "Maximum 60 vaccinated children allowed"]
        },

        // Section 6: AFP and Zero Dose
        afpCasesNoticed: { type: Number, default: 0 },
        zeroDoseRIRecorded: { type: Number, default: 0 },

        // Section 7: Unvaccinated Children
        unvaccinatedChildren: {
            type: [unvaccinatedChildSchema],
            validate: [arr => arr.length <= 5, "Maximum 5 unvaccinated children allowed"]
        },

        // Section 8: Weakness / Paralysis Cases
        weaknessParalysis: {
            type: [weaknessParalysisSchema],
            validate: [arr => arr.length <= 5, "Maximum 5 weakness/paralysis cases allowed"]
        },

        // Section 9: Logistics Record (Exact structure as Tally Sheet)
        logistics: {
            vaccines: {
                received: { sealPacked: { type: Number, default: 0 }, partiallyUsed: { type: Number, default: 0 } },
                returned: { sealPacked: { type: Number, default: 0 }, partiallyUsed: { type: Number, default: 0 } },
                used: { sealPacked: { type: Number, default: 0 }, partiallyUsed: { type: Number, default: 0 } }
            },
            capsules: {
                received: { red: { type: Number, default: 0 }, blue: { type: Number, default: 0 } },
                used: { red: { type: Number, default: 0 }, blue: { type: Number, default: 0 } },
                returned: { red: { type: Number, default: 0 }, blue: { type: Number, default: 0 } }
            },
            markers: {
                received: { type: Number, default: 0 },
                used: { type: Number, default: 0 },
                returned: { type: Number, default: 0 }
            }
        },

        // Auto-Calculated Summary Data
        summary: {
            totalVaccinated: { type: Number, default: 0 },
            totalUnvaccinated: { type: Number, default: 0 }
        }
    },
    { timestamps: true }
);

// Prevent duplicate Fixed Sheets for the same team on the same day
fixedSheetSchema.index({ campaign: 1, team: 1, campaignDay: 1 }, { unique: true });

// Pre-Save Hook for Auto-Calculations
fixedSheetSchema.pre("save", function (next) {
    // Dynamically calculate summary totals based on the array lengths
    this.summary.totalVaccinated = this.vaccinatedChildren ? this.vaccinatedChildren.length : 0;
    this.summary.totalUnvaccinated = this.unvaccinatedChildren ? this.unvaccinatedChildren.length : 0;
    if (this.status === "Finalized") {
        validateLogisticsConservation(this.logistics, "Fixed Sheet");
    }

    if (typeof next === "function") next();
});

export const FixedSheet = mongoose.model("FixedSheet", fixedSheetSchema);
