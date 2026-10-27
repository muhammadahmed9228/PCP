import { Router } from "express";
import { verifyJWT, requireRoles } from "../../middlewares/auth.middleware.js";
import { generateDraft, finalize, reopen } from "./form2a.controller.js";

const router = Router();
router.use(verifyJWT); // Secure for AICs

router.route("/area/:areaId/day/:day")
    .get(requireRoles("AIC"), generateDraft); // Uses GET because it fetches/calculates without needing a body

router.route("/area/:areaId/day/:day/finalize")
    .patch(requireRoles("AIC"), finalize);

router.route("/area/:areaId/day/:day/reopen")
    .patch(requireRoles("UCI"), reopen);

export default router;
