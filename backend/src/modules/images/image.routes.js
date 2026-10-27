import { Router } from "express";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { uploadUciImage, uploadAreaImage, uploadGeographyImage } from "./image.controller.js";

const router = Router();
router.use(verifyJWT);
router.post("/uci", uploadUciImage);
router.post("/area/:areaId", uploadAreaImage);
router.post("/geography/:kind/:id", uploadGeographyImage);

export default router;
