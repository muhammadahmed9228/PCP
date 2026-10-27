import { Router } from "express";
import { verifyJWT, requireRoles } from "../../middlewares/auth.middleware.js";
import { saveDraft, getTransitSheet, finalize, reopen } from "./transitSheet.controller.js";

const router = Router();

// Secure all routes with JWT middleware (Accessible by FieldTeams and AICs)
router.use(verifyJWT, requireRoles("AIC", "FieldTeam"));

// Base data entry routes
router.route("/team/:teamId/day/:day")
    .get(getTransitSheet)
    .post(saveDraft);

// Finalization route
router.route("/team/:teamId/day/:day/finalize")
    .patch(finalize);

router.route("/team/:teamId/day/:day/reopen")
    .patch(requireRoles("AIC"), reopen);

export default router;
