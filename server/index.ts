import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { apiRouter } from "./routes/api";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use("/api", apiRouter);

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/dist")));

  // SPA fallback
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/dist/index.html"));
  });
}

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("[Server Error]", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
});

app.listen(PORT, () => {
  console.log(`[Server] Running on http://localhost:${PORT}`);
  console.log(`[Server] Environment: ${process.env.NODE_ENV || "development"}`);

  // Check for required environment variables
  if (!process.env.DATABASE_URL) {
    console.warn("[Server] WARNING: DATABASE_URL not set - database features will not work");
  }
  if (!process.env.GEMINI_API_KEY) {
    console.warn("[Server] WARNING: GEMINI_API_KEY not set - lease abstraction will not work");
  }
});
