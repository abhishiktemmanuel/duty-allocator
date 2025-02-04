import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      "/api": import.meta.env.VITE_BACKEND_URL,
    },
  },
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    include: ["jwt-decode"],
  },
});
