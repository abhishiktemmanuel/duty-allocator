import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./db/index.js";
import dbSwitcher from "./middlewares/dbSwitcher.js";
import bodyParser from "body-parser";

const app = express();

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());

// Connect to the master database
connectDB()
  .then(() => {
    console.log("Connected to Master DB");
  })
  .catch((err) => {
    console.error("Error connecting to Master DB:", err);
    process.exit(1);
  });

// Import routes
import teacherRoutes from "./routes/teacher.routes.js";
import scheduleRoutes from "./routes/schedule.routes.js";
import dutyRoutes from "./routes/duty.routes.js";
import subjectRoutes from "./routes/subject.routes.js";
import schoolRoutes from "./routes/school.routes.js";
import authRoutes from "./routes/auth.routes.js";
import ticketRoutes from "./routes/ticket.routes.js";
import subscriptionRoutes from "./routes/subscription.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import organizationRoutes from "./routes/organization.routes.js"; // New import

// Route declarations
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/organizations", organizationRoutes); // New route
app.use("/api/v1/teachers", dbSwitcher, teacherRoutes);
app.use("/api/v1/subjects", dbSwitcher, subjectRoutes);
app.use("/api/v1/schools", dbSwitcher, schoolRoutes);
app.use("/api/v1/schedules", dbSwitcher, scheduleRoutes);
app.use("/api/v1/duty", dbSwitcher, dutyRoutes);
app.use("/api/v1/tickets", dbSwitcher, ticketRoutes);
app.use("/api/v1/subscriptions", subscriptionRoutes);
app.use("/api/v1/profile", profileRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

export default app;
