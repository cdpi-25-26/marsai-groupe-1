/**
 * @bref Routes User - Gestion des utilisateurs (Admin uniquement)
 */

import express from "express";
import UserController from "../controllers/UserController.js";
import { requireAuth } from "../middlewares/AuthMiddleware.js";
import {
  validateRequired,
  validateEmail,
  validateRole,
  validateCountryCode,
} from "../middlewares/validation.js";

const userRouter = express.Router();

/**
 * @bref Toutes les routes nécessitent l'authentification Admin
 */
userRouter.use(requireAuth(["ADMIN"]));

/**
 * @bref Routes
 */
userRouter.get("/", UserController.getUsers);
userRouter.get("/:id", UserController.getUserById);
userRouter.post(
  "/",
  validateRequired(["email", "username", "password"]),
  validateEmail,
  validateRole,
  validateCountryCode,
  UserController.createUser
);
userRouter.put(
  "/:id",
  validateEmail,
  validateRole,
  validateCountryCode,
  UserController.updateUser
);
userRouter.delete("/:id", UserController.deleteUser);

export default userRouter;
