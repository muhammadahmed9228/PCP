import { Router } from "express";
import { verifyJWT, requireRoles } from "../../middlewares/auth.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { getFieldDays, changeFieldDay } from "./fieldDay.service.js";

const router = Router();
router.use(verifyJWT, requireRoles("AIC"));
router.get("/:areaId", asyncHandler(async (req, res) => {
    res.json(new ApiResponse(200, await getFieldDays(req.params.areaId, req.user), "Field days retrieved"));
}));
router.patch("/:areaId", asyncHandler(async (req, res) => {
    res.json(new ApiResponse(200, await changeFieldDay(req.params.areaId, req.user, req.body), "Field day updated"));
}));
export default router;
