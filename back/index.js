import express from "express";
import cors from "cors";
import path from "path";
import multer from "multer";
import router from "./src/routes/index.js";
import { configDotenv } from "dotenv";

configDotenv();

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use("/uploads", express.static(path.resolve("uploads")));

const PORT = process.env.PORT || 3000;

app.use("/", router);

// Gestion des erreurs multer
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "Le fichier est trop volumineux (max 5 Mo)" });
    }
    return res.status(400).json({ error: err.message });
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
});

app.listen(PORT, () => {
  console.log("-----------------------------");
  console.log("--        L'ARBITRE        --");
  console.log("-----------------------------");
  console.log(`Le serveur est lancé sur http://localhost:${PORT}`);
});
