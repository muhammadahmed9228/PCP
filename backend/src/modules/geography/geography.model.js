import mongoose from "mongoose";
import { imageAssetSchema } from "../shared/imageAsset.js";

const baseGeographySchema = {
    // Relational linkages enforcing data boundaries[cite: 1]
    campaign: { type: mongoose.Schema.Types.ObjectId, ref: "Campaign", required: true, index: true },
    uci: { type: mongoose.Schema.Types.ObjectId, ref: "UCI", required: true },
    aic: { type: mongoose.Schema.Types.ObjectId, ref: "AIC", required: true },
    area: { type: mongoose.Schema.Types.ObjectId, ref: "Area", required: true, index: true }
};

const routeSchema = new mongoose.Schema(
    {
        routeNo: { type: String, required: true, trim: true },
        routeName: { type: String, required: true, trim: true },
        routeSequence: { type: String, required: true, trim: true }, // String — e.g. "1", "1A"
        routeDescription: { type: String, trim: true },
        routeImage: { type: imageAssetSchema },
        campaignDay: { type: Number, required: true, min: 1, max: 3 }, // Mobile teams: Days 1–3[cite: 1]
        // Route is owned by a specific Mobile team[cite: 1]
        team: { type: mongoose.Schema.Types.ObjectId, ref: "Team", index: true },
        ...baseGeographySchema
    },
    { timestamps: true }
);

// Points represent both Fixed and Transit locations[cite: 1]
const pointSchema = new mongoose.Schema(
    {
        pointNo: { type: String, required: true, trim: true },
        pointName: { type: String, required: true, trim: true },
        // No pointSequence — not required for Fixed/Transit teams[cite: 1]
        pointDescription: { type: String, trim: true },
        pointImage: { type: imageAssetSchema },
        pointType: { type: String, enum: ["Fixed", "Transit"], required: true },
        campaignDay: { type: Number, required: true, min: 1, max: 7 }, // Fixed/Transit: up to 7 days[cite: 1]
        // Point is owned by a specific Fixed or Transit team[cite: 1]
        team: { type: mongoose.Schema.Types.ObjectId, ref: "Team", index: true },
        ...baseGeographySchema
    },
    { timestamps: true }
);

// Prevent duplicate route/point numbers for the same team on the same day[cite: 1]
routeSchema.index(
    { area: 1, aic: 1, team: 1, campaignDay: 1, routeNo: 1 },
    { unique: true, partialFilterExpression: { team: { $type: "objectId" } }, name: "assigned_route_unique" }
);
pointSchema.index(
    { area: 1, aic: 1, team: 1, campaignDay: 1, pointNo: 1 },
    { unique: true, partialFilterExpression: { team: { $type: "objectId" } }, name: "assigned_point_unique" }
);

export const Route = mongoose.model("Route", routeSchema);
export const Point = mongoose.model("Point", pointSchema);
