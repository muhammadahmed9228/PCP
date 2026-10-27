import { ApiError } from "./ApiError.js";

export const validateReopenReason = (reason) => {
    const normalizedReason = typeof reason === "string" ? reason.trim() : "";
    if (!normalizedReason) {
        throw new ApiError(400, "A reason is required to reopen a finalized record.");
    }
    if (normalizedReason.length > 500) {
        throw new ApiError(400, "The reopen reason cannot exceed 500 characters.");
    }
    return normalizedReason;
};
