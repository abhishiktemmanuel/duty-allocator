import { Router } from "express";
import {
  createTicket,
  getTickets,
  updateTicketStatus,
  addComment,
} from "../controllers/ticket.controller.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = Router();

router.route("/create").post(authMiddleware, createTicket);
router.route("/").get(authMiddleware, getTickets);
router.route("/:ticketId/status").patch(authMiddleware, updateTicketStatus);
router.route("/:ticketId/comments").post(authMiddleware, addComment);

export default router;
