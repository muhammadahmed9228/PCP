import { Router } from "express";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { getOperationalContext } from "./context.controller.js";

const router = Router();
router.use(verifyJWT);

router.route("/bootstrap").get(getOperationalContext);

export default router;