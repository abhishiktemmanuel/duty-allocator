import { Router } from "express";
import { dutySetter } from "../controllers/duty.controller.js";
const router = Router();
router.route("/setduty").get(dutySetter);
export default router;
