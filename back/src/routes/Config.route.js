import express from "express";
import SubmissionConfig from "../models/SubmissionConfig.js";
import { requireAuth } from "../middlewares/AuthMiddleware.js";
import { asyncHandler } from "../middlewares/errorHandler.js";

const configRouter = express.Router();

configRouter.get(
  "/",
  requireAuth(["ADMIN"]),
  asyncHandler(async (_req, res) => {
    const configs = await SubmissionConfig.findAll();
    const result = {};
    configs.forEach((c) => {
      result[c.key] = c.value;
    });
    res.json(result);
  })
);

configRouter.put(
  "/",
  requireAuth(["ADMIN"]),
  asyncHandler(async (req, res) => {
    const entries = req.body;
    if (!entries || typeof entries !== "object") {
      return res.status(400).json({ error: "Body must be a key-value object" });
    }

    for (const [key, value] of Object.entries(entries)) {
      await SubmissionConfig.upsert({ key, value: String(value) });
    }

    const configs = await SubmissionConfig.findAll();
    const result = {};
    configs.forEach((c) => {
      result[c.key] = c.value;
    });
    res.json({ message: "Configuration mise à jour", config: result });
  })
);

export default configRouter;
