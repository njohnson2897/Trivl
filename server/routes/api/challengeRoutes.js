import express from "express";
import { authenticateToken } from "../../middleware/auth.js";
import { createChallenge, getPendingChallenges, acceptChallenge, getChallengeDetails } from "../../controllers/challengeControllers.js";

const router = express.Router();

router.post("/create", authenticateToken, createChallenge);
router.get("/pending", authenticateToken, getPendingChallenges);
router.get("/:challengeId", authenticateToken, getChallengeDetails);
router.post("/:challengeId/accept", authenticateToken, acceptChallenge);

export default router;
