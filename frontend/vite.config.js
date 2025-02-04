import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import process from "process";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  return {
    server: {
      proxy: {
        "/api": env.VITE_BACKEND_URL,
      },
    },
    plugins: [react(), tailwindcss()],
    optimizeDeps: {
      include: ["jwt-decode"],
    },
  };
});
