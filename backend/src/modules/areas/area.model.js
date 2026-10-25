import mongoose from "mongoose";

const areaSchema = new mongoose.Schema(
    {
        areaNo: { type: String, required: true, trim: true },
        areaName: { type: String, required: true, trim: true },
        areaDescription: { type: String, trim: true },
        
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

export const Area = mongoose.model("Area", areaSchema);