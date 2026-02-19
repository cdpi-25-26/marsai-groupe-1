import express from "express";
import VideoController from "../controllers/VideoController.js";
import upload from "../config/upload.js";

const videoRouter = express.Router();

videoRouter.get("/", VideoController.getVideos);
videoRouter.post("/", VideoController.createVideo);
videoRouter.patch("/:id/thumbnail", upload.single("thumbnail"), VideoController.uploadThumbnail);

export default videoRouter;
