import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./db/index.js"; // Import the master DB connection function
import dbSwitcher from "./middlewares/dbSwitcher.js"; // Import the dbSwitcher middleware

const app = express();

// Middleware for parsing JSON, cookies, and handling CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
  })
);
app.use(express.json());
app.use(cookieParser());

// Connect to the master database
connectDB()
  .then(() => {
    console.log("Connected to Master DB");
  })
  .catch((err) => {
    console.error("Error connecting to Master DB:", err);
    process.exit(1); // Exit if the master DB connection fails
  });

// Import routes
import teacherRoutes from "./routes/teacher.routes.js";
import scheduleRoutes from "./routes/schedule.routes.js";
import dutyRoutes from "./routes/duty.routes.js";
import subjectRoutes from "./routes/subject.routes.js";
import schoolRoutes from "./routes/school.routes.js";
import authRoutes from "./routes/auth.routes.js";
// Route declarations
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/teachers", dbSwitcher, teacherRoutes);
app.use("/api/v1/subjects", dbSwitcher, subjectRoutes);
app.use("/api/v1/schools", dbSwitcher, schoolRoutes);
app.use("/api/v1/schedules", dbSwitcher, scheduleRoutes);
app.use("/api/v1/duty", dbSwitcher, dutyRoutes);

export default app;
