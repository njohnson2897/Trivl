import express from "express";
import { getScoresByUser, getLeaderboard } from "../../controllers/scoreControllers.js";
import { authenticateToken } from "../../middleware/auth.js";

const router = express.Router();

// Must come before /:userId, or "leaderboard" would be read as a user id.
router.get("/leaderboard", authenticateToken, getLeaderboard);
router.get("/:userId", authenticateToken, getScoresByUser);

export default router;
