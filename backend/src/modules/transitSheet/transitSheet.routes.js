import { Router } from "express";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { saveDraft, getTransitSheet, finalize } from "./transitSheet.controller.js";

const router = Router();

// Secure all routes with JWT middleware (Accessible by FieldTeams and AICs)
router.use(verifyJWT);

// Base data entry routes
router.route("/team/:teamId/day/:day")
    .get(getTransitSheet)
    .post(saveDraft);

// Finalization route
router.route("/team/:teamId/day/:day/finalize")
    .patch(finalize);

export default router;