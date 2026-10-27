import { Router } from "express";
import { verifyJWT, requireRoles } from "../../middlewares/auth.middleware.js";
import { saveDraft, finalize, getAMP, listReviews, getReview, approve, reopen } from "./amp.controller.js";

const router = Router();
router.use(verifyJWT);

router.get("/reviews/campaign/:campaignId", requireRoles("UCI"), listReviews);
router.get("/reviews/area/:areaId", requireRoles("UCI"), getReview);
router.patch("/reviews/area/:areaId/approve", requireRoles("UCI"), approve);
router.patch("/reviews/area/:areaId/reopen", requireRoles("UCI"), reopen);

router.route("/area/:areaId")
    .get(requireRoles("AIC"), getAMP)
    .post(requireRoles("AIC"), saveDraft);

router.route("/area/:areaId/finalize")
    .patch(requireRoles("AIC"), finalize);

export default router;
