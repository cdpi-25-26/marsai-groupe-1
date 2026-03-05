import express from "express";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/CategoryController.js";
import { requireAuth } from "../middlewares/AuthMiddleware.js";

const categoryRouter = express.Router();

/**
 * @bref Public — liste des catégories
 */
categoryRouter.get("/", getCategories);

/**
 * @bref Admin — créer, modifier, supprimer une catégorie
 */
categoryRouter.post("/", requireAuth(["ADMIN"]), createCategory);
categoryRouter.patch("/:id", requireAuth(["ADMIN"]), updateCategory);
categoryRouter.delete("/:id", requireAuth(["ADMIN"]), deleteCategory);

export default categoryRouter;
