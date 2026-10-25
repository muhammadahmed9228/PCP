import { Router } from "express";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { getOrGenerateForm2B, finalize, reopen } from "./form2b.controller.js";

const router = Router();

// Strictly restricted to UCI role
router.use(verifyJWT);

router.route("/campaign/:campaignId/day/:day")
    .get(getOrGenerateForm2B);

router.route("/campaign/:campaignId/day/:day/finalize")
    .patch(finalize);

router.route("/campaign/:campaignId/day/:day/reopen")
    .patch(reopen);

export default router;