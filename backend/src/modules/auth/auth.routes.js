import { Router } from "express";
import { registerUCI, loginUCI, logoutUCI } from "./auth.controller.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { loginAIC, logoutAIC } from "./auth.controller.js";
import { loginTeam, logoutTeam } from "./auth.controller.js";

const router = Router();

router.route("/uci/register").post(registerUCI);
router.route("/uci/login").post(loginUCI);

// Secured routes
router.route("/uci/logout").post(verifyJWT, logoutUCI);


// Public AIC Route
router.route("/aic/login").post(loginAIC);

// Secured AIC Route
router.route("/aic/logout").post(verifyJWT, logoutAIC);


router.route("/team/login").post(loginTeam);
router.route("/team/logout").post(verifyJWT, logoutTeam);

export default router;