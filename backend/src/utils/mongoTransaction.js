import mongoose from "mongoose";
import { ApiError } from "./ApiError.js";

/**
 * Runs a unit of work atomically on MongoDB deployments that support
 * transactions (replica sets and sharded clusters). Reopening changes both
 * the source record and its aggregate, so silently falling back to separate
 * writes would risk a permanently inconsistent report.
 */
export const withMongoTransaction = async (work) => {
    const session = await mongoose.startSession();

    try {
        let result;
        await session.withTransaction(
            async () => {
                result = await work(session);
            },
            {
                readConcern: { level: "snapshot" },
                writeConcern: { w: "majority" },
                readPreference: "primary"
            }
        );
        return result;
    } catch (error) {
        if (error?.code === 20 || error?.codeName === "IllegalOperation") {
            throw new ApiError(
                503,
                "This state-changing operation requires MongoDB transactions. Configure MongoDB as a replica set or sharded cluster."
            );
        }
        throw error;
    } finally {
        await session.endSession();
    }
};
