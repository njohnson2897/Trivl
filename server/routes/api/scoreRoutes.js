import express from "express";
import { getScoresByUser } from "../../controllers/scoreControllers.js";
import { authenticateToken } from "../../middleware/auth.js";

const router = express.Router();

router.get("/:userId", authenticateToken, getScoresByUser);

export default router;
