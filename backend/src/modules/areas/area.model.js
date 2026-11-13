import mongoose from "mongoose";
import { imageAssetSchema } from "../shared/imageAsset.js";

const areaSchema = new mongoose.Schema(
    {
        areaNo: { type: String, required: true, trim: true },
        areaName: { type: String, required: true, trim: true },
        areaDescription: { type: String, trim: true },
        areaImage: { type: imageAssetSchema },
        fieldDay: {
            // Legacy global values are read only until the first per-team change.
            enabledDay: { type: Number, default: null, min: 1, max: 7 },
            lastDay: { type: Number, default: null, min: 1, max: 7 },
            teamControlVersion: { type: Number, default: 0 },
            teams: [{
                _id: false,
                team: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
                enabledDay: { type: Number, default: null, min: 1, max: 7 },
                lastDay: { type: Number, default: null, min: 1, max: 7 }
            }],
            revision: { type: Number, default: 0 },
            writeSerial: { type: Number, default: 0 },
            history: [{
                _id: false,
                action: { type: String, enum: ["enable", "close"] },
                day: Number,
                teams: [{ type: mongoose.Schema.Types.ObjectId, ref: "Team" }],
                actor: { type: mongoose.Schema.Types.ObjectId, ref: "AIC" },
                at: Date
            }]
        },
        
        // Relational linkages to enforce data boundaries
        campaign: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Campaign",
            required: true,
            index: true
        },
        uci: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "UCI",
            required: true,
            index: true
        },
        aic: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "AIC",
            required: true,
            index: true
        }
    },
    { timestamps: true }
);

// Prevent duplicate Area Numbers within the exact same campaign to maintain data integrity
areaSchema.index({ campaign: 1, areaNo: 1 }, { unique: true });
// An AIC can own one area in each campaign, including historical campaigns.
areaSchema.index({ campaign: 1, aic: 1 }, { unique: true, name: "one_area_per_aic_per_campaign" });

export const Area = mongoose.model("Area", areaSchema);
