import express from "express";
import { requireAuth } from "../middlewares/AuthMiddleware.js";
import {
  getJuryMembers,
  getAttributions,
  autoAttribution,
  manualAssign,
  removeAttribution,
} from "../controllers/JuryAttributionController.js";

const router = express.Router();

// Toutes les routes sont ADMIN uniquement
router.use(requireAuth(["ADMIN"]));

router.get("/jury-members",        getJuryMembers);
router.get("/attributions",        getAttributions);
router.post("/attributions/auto",  autoAttribution);
router.post("/attributions/manual",manualAssign);
router.delete("/attributions/:id", removeAttribution);

export default router;
