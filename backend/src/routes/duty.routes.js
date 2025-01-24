import { Router } from "express";
import { dutySetter } from "../controllers/duty.controller.js";
const router = Router();
router.route("/duty").get(dutySetter);
export default router;
