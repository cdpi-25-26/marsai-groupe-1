import User from "../models/User.js";
import { hashPassword } from "../utils/password.js";

// Liste
function getUsers(req, res) {
  User.findAll().then((users) => {
    res.json(users);
  });
}

// Création
function createUser(req, res) {
  if (!req.body) {
    return res.status(400).json({ error: "Données manquantes" });
  }

  const { username, email, password, role } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "Tous les champs sont requis" });
  }

  User.findOne({ where: { username } }).then(async (user) => {
    if (user) {
      res.json({ message: "Utilisateur déjà existant", user });
    } else {
      const hash = await hashPassword(password);
      User.create({ username, email, password: hash, role: role || "PRODUCER" }).then(
        (newUser) => {
          res.status(201).json({ message: "Utilisateur créé", newUser });
        },
      );
    }
  });
}

// Suppression
function deleteUser(req, res) {
  const { id } = req.params;
  User.destroy({ where: { id } }).then(() => {
    res.status(204).json({ message: "Utilisateur supprimé" });
  });
}

// Modification
function updateUser(req, res) {
  const { id } = req.params;
  const { username, email, password, role } = req.body;

  User.findOne({ where: { id } }).then((user) => {
    if (user) {
      user.username = username || user.username;
      user.email = email || user.email;
      user.password = password || user.password;
      user.role = role || user.role;

      user.save().then((updatedUser) => {
        res.json(updatedUser);
      });
    } else {
      res.status(404).json({ error: "Utilisateur non trouvé" });
    }
  });
}

// Récupérer un utilisateur par ID
function getUserById(req, res) {
  const { id } = req.params;
  User.findOne({ where: { id } }).then((user) => {
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: "Utilisateur non trouvé" });
    }
  });
}

function findUserByUsername(username) {
  return User.findOne({ where: { username } });
}

export default {
  getUsers,
  createUser,
  deleteUser,
  updateUser,
  getUserById,
  findUserByUsername,
};
