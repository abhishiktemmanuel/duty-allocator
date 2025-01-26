// import mongoose from "mongoose";
// import { DB_NAME } from "../constants.js";

// const connectDB = async () => {
//   try {
//     const connectionInstance = await mongoose.connect(
//       `${process.env.MONGODB_URI}/${DB_NAME}`
//     );
//     console.log(`MONGODB CONNECTED: ${connectionInstance.connection.host}`);
//   } catch (error) {
//     console.log("MONGODB CONNECT ERROR", error);
//     process.exit(1);
//   }
// };

// export default connectDB;

import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {});
    console.log("Connected to master database");
  } catch (error) {
    console.error("Master DB connection error:", error);
    process.exit(1);
  }
};

export const getOrgDB = (orgId) => {
  const dbName = `org_${orgId}`;
  return mongoose.connection.useDb(dbName, { useCache: true });
};
