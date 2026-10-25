import { Router } from "express";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { saveDraft, finalize, getUCMP } from "./ucmp.controller.js";

const router = Router();

// Secure all UCMP routes with UCI authentication[cite: 1]
router.use(verifyJWT);

router.route("/campaign/:campaignId")
    .get(getUCMP)
    .post(saveDraft);

router.route("/campaign/:campaignId/finalize")
    .patch(finalize);

export default router;