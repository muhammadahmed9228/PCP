import { Router } from "express";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { registerTeam, getTeams, assignToCampaign } from "./team.controller.js";

const router = Router();
router.use(verifyJWT); // Ensure AIC is authenticated[cite: 1]

router.route("/register").post(registerTeam);
router.route("/").get(getTeams);
router.route("/assign").post(assignToCampaign);

export default router;