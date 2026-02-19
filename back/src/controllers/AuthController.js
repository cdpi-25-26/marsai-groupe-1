import User from "../models/User.js";
import { comparePassword, hashPassword } from "../utils/password.js";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";

function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ error: "Email et mot de passe sont requis" });
  }

  // Recherche par email ou username
  User.findOne({
    where: {
      [Op.or]: [{ email }, { username: email }],
    },
  }).then((user) => {
    if (!user) {
      return res.status(401).json({ error: "Identifiants invalides" });
    }

    comparePassword(password, user.password).then((isMatch) => {
      if (!isMatch) {
        return res.status(401).json({ error: "Identifiants invalides" });
      }

      const token = jwt.sign(
        { username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "1h" },
      );

      return res.status(200).json({
        message: "Connexion réussie",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
        token,
      });
    });
  });
}

async function register(req, res) {
  const { username, email, password, confirmPassword } = req.body;

  // Validation des champs
  if (!username || !email || !password || !confirmPassword) {
    return res.status(400).json({ error: "Tous les champs sont requis" });
  }

  // Vérification de la confirmation du mot de passe
  if (password !== confirmPassword) {
    return res
      .status(400)
      .json({ error: "Les mots de passe ne correspondent pas" });
  }

  // Vérification de la longueur du mot de passe
  if (password.length < 6) {
    return res
      .status(400)
      .json({ error: "Le mot de passe doit contenir au moins 6 caractères" });
  }

  try {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { username }],
      },
    });

    if (existingUser) {
      const field =
        existingUser.email === email ? "email" : "nom d'utilisateur";
      return res
        .status(409)
        .json({ error: `Ce ${field} est déjà utilisé` });
    }

    const hash = await hashPassword(password);
    const newUser = await User.create({
      username,
      email,
      password: hash,
    });

    // Générer un token directement après l'inscription
    const token = jwt.sign({ username }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "1h",
    });

    return res.status(201).json({
      message: "Inscription réussie",
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
      token,
    });
  } catch (error) {
    return res.status(500).json({ error: "Erreur lors de l'inscription" });
  }
}

export default { login, register };
