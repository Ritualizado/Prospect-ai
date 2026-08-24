/**
 * server/index.js
 * -----------------------------------------------------------------------
 * Minimal Express backend that proxies the two external APIs the client
 * needs (Anthropic + Google Places) so their secret keys never reach the
 * browser. This directly resolves the "⚠️ SECURITY NOTE" that was in the
 * original src/services/claudeApi.js: that file called Anthropic straight
 * from the browser with a VITE_-prefixed key, which ships in the client
 * bundle. Every external call now goes:
 *
 *   Browser  --fetch-->  /api/*  (this server, key stays server-side)  -->  external API
 *
 * In production this same process also serves the built client (dist/),
 * so a single deploy target handles both the static app and its API.
 */
import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { rateLimit } from "express-rate-limit";

import claudeRouter from "./routes/claude.js";
import placesRouter from "./routes/places.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 8787;

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

// Basic abuse protection on the API surface. Tune per your traffic/plan.
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", apiLimiter);

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/claude", claudeRouter);
app.use("/api/places", placesRouter);

// Serve the built client in production (`npm run build && npm start`).
const distDir = path.join(__dirname, "..", "dist");
app.use(express.static(distDir));
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  res.sendFile(path.join(distDir, "index.html"), (err) => {
    if (err) next();
  });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`ProspectAI API listening on http://localhost:${PORT}`);
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn("  ANTHROPIC_API_KEY is not set — /api/claude requests will fail.");
  }
  if (!process.env.GOOGLE_PLACES_API_KEY) {
    console.warn("  GOOGLE_PLACES_API_KEY is not set — /api/places requests will fail.");
  }
});
