import { Router } from "express";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { exportExcel } from "./export.controller.js";

const router = Router();
router.use(verifyJWT);
router.post("/excel", exportExcel);

export default router;
