import { Router } from "express";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { generateDraft, finalize } from "./form2a.controller.js";

const router = Router();
router.use(verifyJWT); // Secure for AICs

router.route("/area/:areaId/day/:day")
    .get(generateDraft); // Uses GET because it fetches/calculates without needing a body

router.route("/area/:areaId/day/:day/finalize")
    .patch(finalize);

export default router;