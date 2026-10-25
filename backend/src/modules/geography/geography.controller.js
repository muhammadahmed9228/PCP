import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { createRouteService, createPointService, getGeographyForAreaService } from "./geography.service.js";

export const addRoute = asyncHandler(async (req, res) => {
    const route = await createRouteService(req.body, req.user._id);
    return res.status(201).json(new ApiResponse(201, route, "Route created successfully"));
});

export const addPoint = asyncHandler(async (req, res) => {
    const point = await createPointService(req.body, req.user._id);
    return res.status(201).json(new ApiResponse(201, point, "Point created successfully"));
});

export const getGeography = asyncHandler(async (req, res) => {
    const { areaId } = req.params;
    const data = await getGeographyForAreaService(areaId, req.user);
    return res.status(200).json(new ApiResponse(200, data, "Geography retrieved successfully"));
});