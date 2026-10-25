import { Router } from "express";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { addRoute, addPoint, getGeography } from "./geography.controller.js";

const router = Router();
router.use(verifyJWT); // Ensure AIC is authenticated

router.route("/routes").post(addRoute);
router.route("/points").post(addPoint);
router.route("/area/:areaId").get(getGeography);

export default router;