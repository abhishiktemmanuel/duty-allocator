import { Router } from "express";
import { dutySetter } from "../controllers/duty.controller.js";
const router = Router();
router.route("/dutysetter").post(dutySetter);
export default router;
