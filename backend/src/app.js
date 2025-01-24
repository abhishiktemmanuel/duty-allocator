import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
  })
);

app.use(express.json());

// import routes
import teacherRoutes from "./routes/teacher.routes.js";
import scheduleRoutes from "./routes/schedule.routes.js";
import dutyRoutes from "./routes/duty.routes.js";
import subjectRoutes from "./routes/subject.routes.js";
import schoolRoutes from "./routes/school.routes.js";

// routes decleration
app.use("/api/v1/teachers", teacherRoutes);
app.use("/api/v1/subjects", subjectRoutes);
app.use("/api/v1/schools", schoolRoutes);
app.use("/api/v1/schedules", scheduleRoutes);
app.use("/api/v1/duties", dutyRoutes);

export default app;
