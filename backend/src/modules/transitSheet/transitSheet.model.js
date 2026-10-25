import mongoose from "mongoose";
import { ApiError } from "../../utils/ApiError.js";

const transitSheetSchema = new mongoose.Schema(
    {
        // Relational References
        campaign: { type: mongoose.Schema.Types.ObjectId, ref: "Campaign", required: true },
        area: { type: mongoose.Schema.Types.ObjectId, ref: "Area", required: true },
        uci: { type: mongoose.Schema.Types.ObjectId, ref: "UCI", required: true },
        aic: { type: mongoose.Schema.Types.ObjectId, ref: "AIC", required: true },
        point: { type: mongoose.Schema.Types.ObjectId, ref: "Point", required: true }, // Must be Transit
        team: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true }, // Must be Transit
        campaignDay: { type: Number, required: true, min: 1, max: 7 },
        status: { type: String, enum: ["Draft", "Finalized"], default: "Draft" },

        // Sections 1-4: Snapshot Auto-populated Info
        snapshot: {
            campaignName: String, sia: String, // Reverted to SIA as per your prompt
            uciName: String, uciNo: String,
            aicName: String, aicNo: String,
            province: String, district: String, tehsil: String,
            ucName: String, ucNo: String,
            areaName: String, areaNo: String,
            transitPointName: String, transitPointNumber: String,
            teamNo: String, teamLeaderName: String, teamMemberName: String
        },

        // Section 5: Vaccination Details (Tally Count)
        vaccinatedChildrenCount: {
            type: Number,
            default: 0,
            min: [0, "Cannot have negative vaccinations"],
            max: [245, "Maximum 245 entries allowed per Transit Sheet"]
        },

        // Section 6: Logistics Record (Re-used structure)
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
            totalVaccinated: { type: Number, default: 0 }
        }
    },
    { timestamps: true }
);

transitSheetSchema.index({ campaign: 1, team: 1, campaignDay: 1 }, { unique: true });

// Pre-Save Hook for Auto-Calculations
transitSheetSchema.pre("save", function (next) {
    this.summary.totalVaccinated = this.vaccinatedChildrenCount || 0;
     if (typeof next === "function") next();
});

export const TransitSheet = mongoose.model("TransitSheet", transitSheetSchema);