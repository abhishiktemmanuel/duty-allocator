import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const API_URL = import.meta.env.VITE_API_URL;
export default defineConfig({
  server: {
    proxy: {
      "/api": API_URL,
    },
  },
  plugins: [react(), tailwindcss()],
});
