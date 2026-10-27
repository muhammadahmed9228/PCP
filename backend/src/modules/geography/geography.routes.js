import { Router } from "express";
import { verifyJWT, requireRoles } from "../../middlewares/auth.middleware.js";
import { addRoute, addPoint, getGeography, listRoutes, listPoints, updateRoute, updatePoint, deleteRoute, deletePoint, unassignRoute, unassignPoint, assignRoute, assignPoint } from "./geography.controller.js";

const router = Router();
router.use(verifyJWT); // Ensure AIC is authenticated

router.route("/routes").post(addRoute);
router.route("/points").post(addPoint);
router.route("/area/:areaId").get(getGeography);
router.get("/area/:areaId/routes", requireRoles("AIC"), listRoutes);
router.get("/area/:areaId/points", requireRoles("AIC"), listPoints);
router.route("/routes/:id").patch(updateRoute).delete(deleteRoute);
router.route("/points/:id").patch(updatePoint).delete(deletePoint);
router.route("/routes/:id/unassign").patch(unassignRoute);
router.route("/points/:id/unassign").patch(unassignPoint);
router.patch("/routes/:id/assign", requireRoles("AIC"), assignRoute);
router.patch("/points/:id/assign", requireRoles("AIC"), assignPoint);

export default router;
