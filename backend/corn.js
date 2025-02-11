// Cron job to hit endpoint every 14 sec to keep backend alive always
import { CronJob } from "cron";
import { get } from "https";

const backendUrl = "provide_backend_api_endpoint_that_is_provided_by_rendor";
const job = new CronJob("*/14 * * * * *", function () {
  // This function will be executed every 14 minutes.
  console.log("Restarting server");

  // Perform an HTTPS GET request to hit any backend API.
  get(backendUrl, (res) => {
    if (res.statusCode === 200) {
      console.log("Server restarted");
    } else {
      console.error(
        `failed to restart server with status code: ${res.statusCode}`
      );
    }
  }).on("error", (err) => {
    console.error("Error during Restart:", err.message);
  });
});

// Export the cron job.
export default {
  job,
};
