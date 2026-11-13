import { Router } from "express";
import { verifyJWT, requireRoles } from "../../middlewares/auth.middleware.js";
import { saveDraft, finalize, getOMP, getTotals } from "./omp.controller.js";

const router = Router();
router.use(verifyJWT);
router.get('/team/:teamId/totals', requireRoles('AIC'), getTotals);

router.route("/team/:teamId/day/:day")
    .get(getOMP)
    .post(saveDraft);

router.route("/team/:teamId/day/:day/finalize")
    .patch(finalize);

export default router;
