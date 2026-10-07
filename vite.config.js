import { defineConfig } from "vite";

export default defineConfig({
  server: {
    host: "0.0.0.0",
    allowedHosts: true,
    proxy: {
      "/api": "http://localhost:5000",
    },
  },
  preview: {
    proxy: {
      "/api": "http://localhost:5000",
    },
  },
});