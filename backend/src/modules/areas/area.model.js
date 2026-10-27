import mongoose from "mongoose";
import { imageAssetSchema } from "../shared/imageAsset.js";

const areaSchema = new mongoose.Schema(
    {
        areaNo: { type: String, required: true, trim: true },
        areaName: { type: String, required: true, trim: true },
        areaDescription: { type: String, trim: true },
        areaImage: { type: imageAssetSchema },
        
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
