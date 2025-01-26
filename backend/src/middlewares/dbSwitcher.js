import { getOrgDB } from "../db/index.js"; // Utility function to get org-specific DB
import { Subject } from "../models/subject.model.js"; // Import pre-defined models
import { School } from "../models/school.model.js"; // Import other models as needed
import { Teacher } from "../models/teacher.model.js";
import { Duty } from "../models/duty.model.js";
import { ExamSchedule } from "../models/examSchedule.model.js";

export default async (req, res, next) => {
  try {
    // Retrieve organization ID from headers
    const orgId = req.headers["x-org-id"];

    if (!orgId) {
      console.error("Missing Organization ID in request headers");
      return res.status(400).json({ message: "Organization ID is required" });
    }

    console.log(`Switching to organization database for orgId: ${orgId}`); // Debugging log

    // Dynamically switch to the organization's database
    const orgDb = getOrgDB(orgId);

    if (!orgDb) {
      console.error(`Failed to switch database for orgId: ${orgId}`);
      return res.status(404).json({ message: "Invalid Organization ID" });
    }

    // Dynamically compile models for this database using their schemas
    req.models = {
      Subject: orgDb.model("Subject", Subject.schema),
      School: orgDb.model("School", School.schema),
      Teacher: orgDb.model("Teacher", Teacher.schema),
      Duty: orgDb.model("Duty", Duty.schema),
      ExamSchedule: orgDb.model("ExamSchedule", ExamSchedule.schema),
      // Add other models as needed
    };

    console.log(
      `Successfully switched to organization database for orgId: ${orgId}`
    ); // Debugging log

    next(); // Proceed to the next middleware/controller
  } catch (error) {
    console.error("Error in DB switcher middleware:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};
