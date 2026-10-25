import { Router } from "express";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { saveDraft, getTallySheet, finalize } from "./tallySheet.controller.js";

const router = Router();
router.use(verifyJWT); // Ensures caller is authenticated (e.g., AIC)

// Base route requires teamId and campaignDay
router.route("/team/:teamId/day/:day")
    .get(getTallySheet)
    .post(saveDraft);

router.route("/team/:teamId/day/:day/finalize")
    .patch(finalize);

export default router;