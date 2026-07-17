import { healthcheck } from "../controllers/health.controller.js";
import { Router } from "express";
const HealthRouter = Router();
HealthRouter.route("/").get(healthcheck);
export default HealthRouter;
