import { Router } from "express";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { saveDraft, finalize, getOMP } from "./omp.controller.js";

const router = Router();
router.use(verifyJWT);

router.route("/team/:teamId/day/:day")
    .get(getOMP)
    .post(saveDraft);

router.route("/team/:teamId/day/:day/finalize")
    .patch(finalize);

export default router;