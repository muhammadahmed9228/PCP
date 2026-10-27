import dotenv from "dotenv";
import mongoose from "mongoose";
import { Route, Point } from "../src/modules/geography/geography.model.js";

dotenv.config({ path: "./.env" });

if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is required to migrate geography indexes");
}

const indexes = [
    {
        Model: Route,
        oldName: "area_1_aic_1_team_1_campaignDay_1_routeNo_1",
        newName: "assigned_route_unique",
        keys: { area: 1, aic: 1, team: 1, campaignDay: 1, routeNo: 1 }
    },
    {
        Model: Point,
        oldName: "area_1_aic_1_team_1_campaignDay_1_pointNo_1",
        newName: "assigned_point_unique",
        keys: { area: 1, aic: 1, team: 1, campaignDay: 1, pointNo: 1 }
    }
];

await mongoose.connect(process.env.MONGODB_URI, { autoIndex: false });
try {
    for (const { Model, oldName, newName, keys } of indexes) {
        const existing = await Model.collection.indexes();
        if (!existing.some(index => index.name === newName)) {
            // Create the replacement before removing the old uniqueness constraint.
            await Model.collection.createIndex(keys, {
                name: newName,
                unique: true,
                partialFilterExpression: { team: { $type: "objectId" } }
            });
        }
        if (existing.some(index => index.name === oldName)) {
            await Model.collection.dropIndex(oldName);
        }
        console.log(`${Model.modelName}: assigned-only unique index ready`);
    }
} finally {
    await mongoose.disconnect();
}
