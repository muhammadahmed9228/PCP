import { ApiError } from "./ApiError.js";

export const escapeListSearch = value => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const parseListQuery = (query, allowedSorts, defaultSort = "createdAt") => {
    const integer = (name, fallback, maximum) => {
        const value = query[name];
        if (value === undefined) return fallback;
        if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) throw new ApiError(400, `Invalid ${name}`);
        const parsed = Number(value);
        if (!Number.isSafeInteger(parsed) || parsed > maximum) throw new ApiError(400, `Invalid ${name}`);
        return parsed;
    };
    const page = integer("page", 1, 100000);
    const limit = integer("limit", 10, 100);
    const search = query.search ?? "";
    if (typeof search !== "string" || search.length > 100) throw new ApiError(400, "Search must be at most 100 characters");
    const sort = query.sort ?? defaultSort;
    if (typeof sort !== "string" || !allowedSorts.includes(sort)) throw new ApiError(400, "Invalid sort field");
    const order = query.order ?? "desc";
    if (order !== "asc" && order !== "desc") throw new ApiError(400, "Invalid sort order");
    return { page, limit, search: search.trim(), sort, direction: order === "asc" ? 1 : -1 };
};

export const isPagedList = query => ["page", "limit", "search", "sort", "order", "status", "assignment", "employment", "aicId"]
    .some(key => query[key] !== undefined);
