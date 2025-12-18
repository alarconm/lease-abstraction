import express from "express";
import multer from "multer";
import path from "path";
import { propertiesRouter } from "./properties";
import { tenantsRouter } from "./tenants";
import { leasesRouter } from "./leases";
import { abstractsRouter } from "./abstracts";
import { exportRouter } from "./export";

export const apiRouter = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept PDFs, images, and Word documents
    const allowedTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/tiff",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not supported`));
    }
  },
});

// Health check
apiRouter.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    database: !!process.env.DATABASE_URL,
    gemini: !!process.env.GEMINI_API_KEY,
  });
});

// Mount sub-routers
apiRouter.use("/properties", propertiesRouter);
apiRouter.use("/tenants", tenantsRouter);
apiRouter.use("/leases", leasesRouter(upload));
apiRouter.use("/abstracts", abstractsRouter);
apiRouter.use("/export", exportRouter);
