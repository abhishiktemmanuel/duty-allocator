import { Router } from "express";
import { dutySetter, getAllDuties } from "../controllers/duty.controller.js";
const router = Router();
router.route("/setduty").get(dutySetter);
router.route("/duty/getduties").get(getAllDuties);
export default router;
