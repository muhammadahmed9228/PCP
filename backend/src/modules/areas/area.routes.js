import { Router } from "express";
import { verifyJWT, requireRoles } from "../../middlewares/auth.middleware.js";
import { 
    createAreaAndAssign, 
    getAreasForCampaign, 
    updateArea, 
    deleteArea 
} from "./area.controller.js";

const router = Router();

// Secure routes with UCI authentication[cite: 1]
router.use(verifyJWT, requireRoles("UCI"));

router.route("/").post(createAreaAndAssign);
router.route("/campaign/:campaignId").get(getAreasForCampaign);
router.route("/:id").patch(updateArea).delete(deleteArea);

export default router;
