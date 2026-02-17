/**
 * @bref Point d'entrée - Plateforme marsAI
 */

import dotenv from "dotenv";
dotenv.config(); 

import express from "express";
import cors from "cors";
import router from "./src/routes/index.js";
import sequelize from "./src/db/connection.js";
import "./src/models/index.js";
import errorHandler from "./src/middlewares/errorHandler.js";
import logger from "./src/utils/logger.js";

const app = express();

/**
 * @bref Middlewares globaux
 */
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json({ limit: "5mb" }));

/**
 * @bref Routes API
 */
app.use("/api", router);

/**
 * @bref Middleware de gestion d'erreurs (doit être en dernier)
 */
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

sequelize
  .sync({ alter: process.env.NODE_ENV !== "production" })
  .then(() => {
    logger.info("Base de données synchronisée");

    app.listen(PORT, () => {
      logger.info("Serveur démarré", { port: PORT, env: process.env.NODE_ENV || "development" });
      console.log("-----------------------------");
      console.log("--     🪐 marsAI Platform 🪐     --");
      console.log("-----------------------------");
      console.log(`Serveur lancé sur http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    logger.error("Erreur sync BDD", { error: err.message });
    process.exit(1);
  });
