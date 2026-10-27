import { Router } from "express";
import { verifyJWT, requireRoles } from "../../middlewares/auth.middleware.js";
import {
    createCampaign,
    getAllCampaigns,
    getCampaignById,
    updateCampaign,
    updateCampaignStatus,
    getCampaignReadiness,
    deleteCampaign,
    complete,
    getCompletionReadiness
} from "./campaign.controller.js";

const router = Router();

// Secure all campaign routes[cite: 1]
router.use(verifyJWT);

router.route("/").post(createCampaign).get(getAllCampaigns);
router.route("/:id").get(getCampaignById).patch(updateCampaign).delete(deleteCampaign);
router.route("/:id/status").patch(updateCampaignStatus);
router.route("/:id/readiness").get(getCampaignReadiness);
router.route("/:id/complete").patch(requireRoles("UCI"), complete);
router.route("/:id/completion-readiness").get(requireRoles("UCI"), getCompletionReadiness);

export default router;
