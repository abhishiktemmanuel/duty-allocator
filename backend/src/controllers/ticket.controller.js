// controllers/ticket.controller.js
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/authModels/User.js";

// Create a new ticket
const createTicket = asyncHandler(async (req, res) => {
  const Ticket = req.models.Ticket;
  const { title, description, priority } = req.body;

  // Get user from global User model
  const user = await User.findById(req.user.id);
  if (!user) {
    throw new ApiError(400, "User not found");
  }

  if (!title || !description) {
    throw new ApiError(400, "Title and description are required");
  }

  const ticket = await Ticket.create({
    title,
    description,
    priority: priority || "MEDIUM",
    raisedBy: user._id,
    organization: user.organizationId,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, ticket, "Ticket created successfully"));
});

// Get tickets based on user role
const getTickets = asyncHandler(async (req, res) => {
  const Ticket = req.models.Ticket;
  const query = {};

  const user = await User.findById(req.user.id);
  if (!user) {
    throw new ApiError(400, "User not found");
  }

  if (user.role === "endUser") {
    query.raisedBy = user._id;
  } else if (user.role === "admin") {
    query.organization = user._id;
  }

  const tickets = await Ticket.find(query)
    .populate("raisedBy", "name")
    .populate("assignedTo", "name")
    .sort("-createdAt");
  return res
    .status(200)
    .json(new ApiResponse(200, tickets, "Tickets retrieved successfully"));
});

// Update ticket status (admin only)
const updateTicketStatus = asyncHandler(async (req, res) => {
  const Ticket = req.models.Ticket;
  const { ticketId } = req.params;
  const { status, comment } = req.body;

  const user = await User.findById(req.user.id);
  if (!user) {
    throw new ApiError(400, "User not found");
  }

  if (!ticketId || !status) {
    throw new ApiError(400, "Ticket ID and status are required");
  }

  const ticket = await Ticket.findById(ticketId);
  if (!ticket) {
    throw new ApiError(404, "Ticket not found");
  }

  if (user.role !== "admin") {
    throw new ApiError(403, "Not authorized to update ticket status");
  }

  ticket.status = status;
  if (comment) {
    ticket.comments.push({
      text: comment,
      createdBy: user._id,
    });
  }

  await ticket.save();

  return res
    .status(200)
    .json(new ApiResponse(200, ticket, "Ticket updated successfully"));
});

// Add comment to ticket
const addComment = asyncHandler(async (req, res) => {
  const Ticket = req.models.Ticket;
  const { ticketId } = req.params;
  const { comment } = req.body;

  const user = await User.findById(req.user.id);
  if (!user) {
    throw new ApiError(400, "User not found");
  }

  if (!ticketId || !comment) {
    throw new ApiError(400, "Ticket ID and comment are required");
  }

  const ticket = await Ticket.findById(ticketId);
  if (!ticket) {
    throw new ApiError(404, "Ticket not found");
  }

  ticket.comments.push({
    text: comment,
    createdBy: user._id,
  });

  await ticket.save();

  return res
    .status(200)
    .json(new ApiResponse(200, ticket, "Comment added successfully"));
});

export { createTicket, getTickets, updateTicketStatus, addComment };
