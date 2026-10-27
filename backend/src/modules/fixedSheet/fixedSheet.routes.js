import { Router } from "express";
import { verifyJWT, requireRoles } from "../../middlewares/auth.middleware.js";
import { saveDraft, getFixedSheet, finalize, reopen } from "./fixedSheet.controller.js";

const router = Router();
router.use(verifyJWT, requireRoles("AIC", "FieldTeam"));

router.route("/team/:teamId/day/:day")
    .get(getFixedSheet)
    .post(saveDraft);

router.route("/team/:teamId/day/:day/finalize")
    .patch(finalize);

router.route("/team/:teamId/day/:day/reopen")
    .patch(requireRoles("AIC"), reopen);

export default router;
