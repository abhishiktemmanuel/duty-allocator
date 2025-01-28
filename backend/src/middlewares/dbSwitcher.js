import { getOrgDB } from "../db/index.js";
import { Subject } from "../models/subject.model.js";
import { School } from "../models/school.model.js";
import { Teacher } from "../models/teacher.model.js";
import { Duty } from "../models/duty.model.js";
import { ExamSchedule } from "../models/examSchedule.model.js";

// Cache for compiled models
const modelCache = new Map();

const getModelForOrg = (db, modelName, schema) => {
  const cacheKey = `${db.name}-${modelName}`;
  if (!modelCache.has(cacheKey)) {
    modelCache.set(cacheKey, db.model(modelName, schema));
  }
  return modelCache.get(cacheKey);
};

export default async (req, res, next) => {
  try {
    const orgId = req.headers["x-org-id"];

    if (!orgId) {
      return res.status(400).json({
        success: false,
        message: "Organization ID is required in headers (x-org-id)",
      });
    }

    // Validate orgId format
    if (!/^[a-zA-Z0-9_-]+$/.test(orgId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Organization ID format",
      });
    }

    try {
      const orgDb = await getOrgDB(orgId);

      // Verify database connection
      await orgDb.db.admin().ping();

      // Compile models with error handling
      req.models = {
        Subject: getModelForOrg(orgDb, "Subject", Subject.schema),
        School: getModelForOrg(orgDb, "School", School.schema),
        Teacher: getModelForOrg(orgDb, "Teacher", Teacher.schema),
        Duty: getModelForOrg(orgDb, "Duty", Duty.schema),
        ExamSchedule: getModelForOrg(
          orgDb,
          "ExamSchedule",
          ExamSchedule.schema
        ),
      };

      // Add organization context to request
      req.orgContext = {
        orgId,
        dbName: orgDb.name,
        timestamp: new Date(),
      };

      next();
    } catch (dbError) {
      console.error(`Database connection error for orgId ${orgId}:`, dbError);

      if (dbError.name === "MongooseServerSelectionError") {
        return res.status(503).json({
          success: false,
          message: "Database service temporarily unavailable",
        });
      }

      return res.status(500).json({
        success: false,
        message: "Failed to connect to organization database",
      });
    }
  } catch (error) {
    console.error("Critical error in DB switcher middleware:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
