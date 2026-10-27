import { Router } from "express";
import { verifyJWT, requireRoles } from "../../middlewares/auth.middleware.js";
import { getOrGenerateForm2B, finalize, reopen } from "./form2b.controller.js";

const router = Router();

// Strictly restricted to UCI role
router.use(verifyJWT);

router.route("/campaign/:campaignId/day/:day")
    .get(requireRoles("UCI"), getOrGenerateForm2B);

router.route("/campaign/:campaignId/day/:day/finalize")
    .patch(requireRoles("UCI"), finalize);

router.route("/campaign/:campaignId/day/:day/reopen")
    .patch(requireRoles("UCI"), reopen);

export default router;
