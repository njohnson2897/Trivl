import express from "express";
import { optionalAuth } from "../../middleware/auth.js";
import {
  startSession,
  getSession,
  submitAnswer,
} from "../../controllers/quizSessionControllers.js";

const router = express.Router();

router.post("/", optionalAuth, startSession);
router.get("/:id", optionalAuth, getSession);
router.post("/:id/answer", optionalAuth, submitAnswer);

export default router;