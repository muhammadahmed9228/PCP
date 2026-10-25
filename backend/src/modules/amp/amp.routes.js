import { Router } from "express";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { saveDraft, finalize, getAMP } from "./amp.controller.js";

const router = Router();
router.use(verifyJWT); // Ensure AIC is authenticated[cite: 1]

router.route("/area/:areaId")
    .get(getAMP)
    .post(saveDraft);

router.route("/area/:areaId/finalize")
    .patch(finalize);

export default router;