/**
 * @bref Routes Auth - Authentification et inscription
 */

import express from "express";
import multer from "multer";
import AuthController from "../controllers/AuthController.js";
import { requireAuth } from "../middlewares/AuthMiddleware.js";
import {
  validateRequired,
  validateEmail,
  validateRole,
  validateCountryCode,
} from "../middlewares/validation.js";

const authRouter = express.Router();

const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Format non supporté (jpg, png, webp, gif uniquement)"), false);
    }
  },
});

authRouter.post(
  "/login",
  validateRequired(["username", "password"]),
  AuthController.login
);

authRouter.post(
  "/register",
  validateRequired(["email", "username", "password"]),
  validateEmail,
  validateRole,
  validateCountryCode,
  AuthController.register
);

/**
 * @bref Routes profil utilisateur connecté
 * GET  /api/auth/me         → récupérer son profil
 * PATCH /api/auth/me        → modifier biography, username, country, socialLinks
 * POST  /api/auth/me/avatar → changer sa photo de profil (multipart)
 */
authRouter.get("/me", requireAuth(), AuthController.getMe);
authRouter.patch("/me", requireAuth(), AuthController.updateMe);
authRouter.post("/me/avatar", requireAuth(), avatarUpload.single("avatar"), AuthController.uploadAvatar);

export default authRouter;
