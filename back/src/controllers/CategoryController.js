import Category from "../models/Category.js";
import { asyncHandler } from "../middlewares/errorHandler.js";
import { AppError } from "../middlewares/errorHandler.js";

/**
 * @bref Récupère toutes les catégories (public)
 */
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.findAll({ order: [["name", "ASC"]] });
  res.json(categories);
});

/**
 * @bref Crée une catégorie (admin uniquement)
 */
export const createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    throw new AppError("Le nom de la catégorie est requis", 400);
  }
  const category = await Category.create({ name: name.trim() });
  res.status(201).json(category);
});

/**
 * @bref Modifie une catégorie (admin uniquement)
 */
export const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name || !name.trim()) {
    throw new AppError("Le nom de la catégorie est requis", 400);
  }
  const category = await Category.findByPk(id);
  if (!category) throw new AppError("Catégorie non trouvée", 404);
  category.name = name.trim();
  await category.save();
  res.json(category);
});

/**
 * @bref Supprime une catégorie (admin uniquement)
 */
export const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const category = await Category.findByPk(id);
  if (!category) throw new AppError("Catégorie non trouvée", 404);
  await category.destroy();
  res.json({ message: "Catégorie supprimée" });
});
