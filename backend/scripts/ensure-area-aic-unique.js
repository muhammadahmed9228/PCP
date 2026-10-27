import dotenv from "dotenv";
import mongoose from "mongoose";
import { Area } from "../src/modules/areas/area.model.js";

dotenv.config({ path: "./.env" });

if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is required to check area assignments");
}

const checkOnly = process.argv.includes("--check");
await mongoose.connect(process.env.MONGODB_URI, { autoIndex: false });

try {
    const duplicates = await Area.aggregate([
        { $group: { _id: { campaign: "$campaign", aic: "$aic" }, count: { $sum: 1 }, areaIds: { $push: "$_id" } } },
        { $match: { count: { $gt: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 100 }
    ]);

    if (duplicates.length) {
        console.error("One or more AICs already have multiple areas in the same campaign. Resolve these records before creating the unique index:");
        for (const duplicate of duplicates) {
            console.error(JSON.stringify({
                campaign: String(duplicate._id.campaign),
                aic: String(duplicate._id.aic),
                areaIds: duplicate.areaIds.map(String),
                count: duplicate.count
            }));
        }
        if (duplicates.length === 100) console.error("Showing at most 100 duplicate groups; rerun after resolving them.");
        process.exitCode = 1;
    } else if (checkOnly) {
        console.log("No duplicate AIC area assignments found within campaigns.");
    } else {
        await Area.collection.createIndex(
            { campaign: 1, aic: 1 },
            { unique: true, name: "one_area_per_aic_per_campaign" }
        );
        console.log("Unique campaign + AIC area index is ready.");
    }
} finally {
    await mongoose.disconnect();
}
