import mongoose from "mongoose";

const CONNECTION_OPTIONS = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000,
  heartbeatFrequencyMS: 2000,
  retryWrites: true,
  w: "majority",
  autoIndex: true,
  connectTimeoutMS: 30000,
};

export const connectDB = async () => {
  try {
    // Disable buffering to prevent timeout issues
    mongoose.set("bufferCommands", false);

    // Set up connection event listeners
    mongoose.connection.on("connected", () => {
      console.log("MongoDB connected successfully");
    });

    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB disconnected. Attempting to reconnect...");
      reconnectDB();
    });

    // Attempt initial connection
    await mongoose.connect(process.env.MONGODB_URI, CONNECTION_OPTIONS);
    console.log("Connected to master database");
  } catch (error) {
    console.error("Master DB connection error:", error);
    process.exit(1);
  }
};

// Reconnection function
const reconnectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, CONNECTION_OPTIONS);
    console.log("Reconnected to master database");
  } catch (error) {
    console.error("Reconnection failed:", error);
    // Retry after 5 seconds
    setTimeout(reconnectDB, 5000);
  }
};

// Enhanced getOrgDB function with connection checking
export const getOrgDB = async (orgId) => {
  if (mongoose.connection.readyState !== 1) {
    throw new Error("Database connection is not ready");
  }

  try {
    const dbName = `org_${orgId}`;
    const db = mongoose.connection.useDb(dbName, {
      useCache: true,
      noListener: true,
    });

    // Verify the connection is working
    await db.db.admin().ping();
    return db;
  } catch (error) {
    console.error(`Error connecting to organization database ${orgId}:`, error);
    throw error;
  }
};

// Helper function to check connection status
export const isConnected = () => {
  return mongoose.connection.readyState === 1;
};

// Helper function for executing operations with retry logic
export const executeWithRetry = async (operation, maxRetries = 3) => {
  let attempts = 0;
  while (attempts < maxRetries) {
    try {
      if (!isConnected()) {
        throw new Error("Database not connected");
      }
      return await operation();
    } catch (error) {
      attempts++;
      if (attempts === maxRetries) {
        throw error;
      }
      // Exponential backoff
      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, attempts) * 1000)
      );
    }
  }
};

// import mongoose from "mongoose";

// export const connectDB = async () => {
//   try {
//     await mongoose.connect(process.env.MONGODB_URI, {});
//     console.log("Connected to master database");
//   } catch (error) {
//     console.error("Master DB connection error:", error);
//     process.exit(1);
//   }
// };

// export const getOrgDB = (orgId) => {
//   const dbName = `org_${orgId}`;
//   return mongoose.connection.useDb(dbName, { useCache: true });
// };
