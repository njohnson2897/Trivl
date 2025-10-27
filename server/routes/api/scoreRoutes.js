import express from "express";
import {
  getScoresByUser,
  logScore,
} from "../../controllers/scoreControllers.js";
import { authenticateToken } from "../../middleware/auth.js";

const router = express.Router();

router.post("/logscore", authenticateToken, logScore);
router.get("/:userId", authenticateToken, getScoresByUser);

export default router;
