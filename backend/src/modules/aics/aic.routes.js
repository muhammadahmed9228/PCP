import { Router } from "express";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { 
    registerAIC, 
    getAICsForUCI, 
    assignAicToCampaign, 
    updateAIC, 
    deleteAIC, 
    unassignAicFromCampaign 
} from "./aic.controller.js";

const router = Router();

// Secure all AIC management routes for UCI[cite: 1]
router.use(verifyJWT);

router.route("/register").post(registerAIC);
router.route("/").get(getAICsForUCI);
router.route("/assign").post(assignAicToCampaign);
router.route("/unassign").post(unassignAicFromCampaign);
router.route("/:id").patch(updateAIC).delete(deleteAIC);

export default router;