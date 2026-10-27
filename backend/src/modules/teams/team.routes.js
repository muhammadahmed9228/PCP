import { Router } from "express";
import { verifyJWT, requireRoles } from "../../middlewares/auth.middleware.js";
import { registerTeam, getTeams, assignToCampaign, updateTeam, deleteTeam } from "./team.controller.js";

const router = Router();
router.use(verifyJWT); // Ensure AIC is authenticated[cite: 1]

router.route("/register").post(registerTeam);
router.route("/").get(requireRoles("AIC"), getTeams);
router.route("/assign").post(assignToCampaign);
router.route("/:id").patch(updateTeam).delete(deleteTeam);

export default router;
