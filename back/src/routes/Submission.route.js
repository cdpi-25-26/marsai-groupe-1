import express from "express";
import SubmissionController from "../controllers/SubmissionController.js";
import upload from "../utils/upload.js";

const submissionRouter = express.Router();

submissionRouter.get("/", SubmissionController.getSubmissions);

submissionRouter.post(
  "/",
  upload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnailFile", maxCount: 1 },
  ]),
  SubmissionController.createSubmission
);

export default submissionRouter;
