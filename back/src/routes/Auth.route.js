/**
 * @bref Routes Auth - Authentification et inscription
 */

import express from "express";
import AuthController from "../controllers/AuthController.js";
import {
  validateRequired,
  validateEmail,
  validateRole,
  validateCountryCode,
} from "../middlewares/validation.js";

const authRouter = express.Router();

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

export default authRouter;
