import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// In dev, the Vite server proxies /api to the Express backend (server/index.js,
// default port 8787) so the browser only ever talks to same-origin /api/* routes.
// In production, the Express server serves the built client AND /api from the
// same origin (see server/index.js), so no proxy config is needed there.
//
// `base` is set for GitHub Pages: the site is served from
// https://Ritualizado.github.io/Prospect-ai/ (a sub-path, not the domain
// root), so every asset URL Vite emits needs the "/Prospect-ai/" prefix or
// the browser requests them from the domain root and gets 404s. This only
// matters for the GH Pages static build — if you deploy elsewhere (Render,
// Vercel, your own domain, or the Express server serving dist/ per
// package.json's "start" script) at the domain root, set this back to "/".
export default defineConfig({
  base: "/Prospect-ai/",
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