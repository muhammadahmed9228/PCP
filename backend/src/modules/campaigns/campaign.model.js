import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema(
    {
        campaignName: { type: String, required: true, trim: true },
        campaignDescription: { type: String, trim: true },
        nameOfSIA: { type: String, required: true, trim: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        status: {
            type: String,
            enum: ["Planning", "Active", "Completed", "Paused", "Cancelled"],
            default: "Planning"
        },
        // Enforce data boundaries: Every campaign must strictly belong to a UCI[cite: 1]
        uci: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "UCI",
            required: true,
            index: true // High-value index for Campaign ownership queries[cite: 1]
        },
        aics: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "AIC"
            }
        ],
        teams: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Team"
            }
        ]
    },
    { timestamps: true }
);

export const Campaign = mongoose.model("Campaign", campaignSchema);