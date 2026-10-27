import { Router } from "express";
import { verifyJWT, requireRoles } from "../../middlewares/auth.middleware.js";
import { saveDraft, getTallySheet, finalize, reopen } from "./tallySheet.controller.js";

const router = Router();
router.use(verifyJWT, requireRoles("AIC", "FieldTeam"));

// Base route requires teamId and campaignDay
router.route("/team/:teamId/day/:day")
    .get(getTallySheet)
    .post(saveDraft);

router.route("/team/:teamId/day/:day/finalize")
    .patch(finalize);

router.route("/team/:teamId/day/:day/reopen")
    .patch(requireRoles("AIC"), reopen);

export default router;
