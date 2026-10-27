import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { Route, Point } from "./geography.model.js";
import { createRouteService, createPointService, getGeographyForAreaService, listGeographyForAreaService, updateRouteService, updatePointService, deleteGeographyService, unassignGeographyService, assignGeographyService } from "./geography.service.js";

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

export const listRoutes = asyncHandler(async (req, res) => {
    const data = await listGeographyForAreaService(req.params.areaId, req.user._id, "routes", req.query);
    return res.status(200).json(new ApiResponse(200, data, "Routes retrieved successfully"));
});

export const listPoints = asyncHandler(async (req, res) => {
    const data = await listGeographyForAreaService(req.params.areaId, req.user._id, "points", req.query);
    return res.status(200).json(new ApiResponse(200, data, "Points retrieved successfully"));
});

export const updateRoute = asyncHandler(async (req, res) => {
    const route = await updateRouteService(req.params.id, req.body, req.user._id);
    return res.status(200).json(new ApiResponse(200, route, "Route updated successfully"));
});

export const updatePoint = asyncHandler(async (req, res) => {
    const point = await updatePointService(req.params.id, req.body, req.user._id);
    return res.status(200).json(new ApiResponse(200, point, "Point updated successfully"));
});

export const deleteRoute = asyncHandler(async (req, res) => {
    const result = await deleteGeographyService(Route, req.params.id, req.user._id);
    return res.status(200).json(new ApiResponse(200, result, "Route unassigned and deleted successfully"));
});

export const deletePoint = asyncHandler(async (req, res) => {
    const result = await deleteGeographyService(Point, req.params.id, req.user._id);
    return res.status(200).json(new ApiResponse(200, result, "Point unassigned and deleted successfully"));
});

export const unassignRoute = asyncHandler(async (req, res) => {
    const route = await unassignGeographyService(Route, req.params.id, req.user._id);
    return res.status(200).json(new ApiResponse(200, route, "Route unassigned successfully"));
});

export const unassignPoint = asyncHandler(async (req, res) => {
    const point = await unassignGeographyService(Point, req.params.id, req.user._id);
    return res.status(200).json(new ApiResponse(200, point, "Point unassigned successfully"));
});

export const assignRoute = asyncHandler(async (req, res) => {
    const route = await assignGeographyService(Route, req.params.id, req.body?.teamId, req.user._id);
    return res.status(200).json(new ApiResponse(200, route, "Route assigned successfully"));
});

export const assignPoint = asyncHandler(async (req, res) => {
    const point = await assignGeographyService(Point, req.params.id, req.body?.teamId, req.user._id);
    return res.status(200).json(new ApiResponse(200, point, "Point assigned successfully"));
});
