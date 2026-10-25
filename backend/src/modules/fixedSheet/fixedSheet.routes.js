import { Router } from "express";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { saveDraft, getFixedSheet, finalize } from "./fixedSheet.controller.js";

const router = Router();
router.use(verifyJWT); // Secure for Field Teams

router.route("/team/:teamId/day/:day")
    .get(getFixedSheet)
    .post(saveDraft);

router.route("/team/:teamId/day/:day/finalize")
    .patch(finalize);

export default router;