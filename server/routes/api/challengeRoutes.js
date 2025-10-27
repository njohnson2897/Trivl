import express from "express";
import { authenticateToken } from "../../middleware/auth.js";
import {
  createChallenge,
  getPendingChallenges,
  getUserChallenges,
  acceptChallenge,
  submitChallengerResults,
  submitChallengedResults,
  getChallengeDetails,
} from "../../controllers/challengeControllers.js";

const router = express.Router();

// Create a new challenge
router.post("/create", authenticateToken, createChallenge);

// Get pending challenges for the current user
router.get("/pending", authenticateToken, getPendingChallenges);

// Get all challenges for the current user
router.get("/list", authenticateToken, getUserChallenges);

// Get challenge details
router.get("/:challengeId", authenticateToken, getChallengeDetails);

// Accept a challenge (start the quiz)
router.post("/:challengeId/accept", authenticateToken, acceptChallenge);

// Submit challenger's results
router.post(
  "/:challengeId/submit-challenger",
  authenticateToken,
  submitChallengerResults
);

// Submit challenged user's results and determine winner
router.post(
  "/:challengeId/submit-challenged",
  authenticateToken,
  submitChallengedResults
);

export default router;
