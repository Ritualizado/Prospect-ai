import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// In dev, the Vite server proxies /api to the Express backend (server/index.js,
// default port 8787) so the browser only ever talks to same-origin /api/* routes.
// In production, the Express server serves the built client AND /api from the
// same origin (see server/index.js), so no proxy config is needed there.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: `http://localhost:${process.env.PORT || 8787}`,
        changeOrigin: true,
      },
    },
  },
});
