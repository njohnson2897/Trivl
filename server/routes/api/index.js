import express from "express";
import userRoutes from "./userRoutes.js";
import scoreRoutes from "./scoreRoutes.js";
import contactRoutes from "./contactRoutes.js";
import achievementRoutes from "./achievementRoutes.js";
import friendRoutes from "./friendRoutes.js";
import challengeRoutes from "./challengeRoutes.js";
import quizSessionRoutes from "./quizSessionRoutes.js";

const router = express.Router();

router.use("/users", userRoutes);
router.use("/scores", scoreRoutes);
router.use("/contact", contactRoutes);
router.use("/achievements", achievementRoutes);
router.use("/friends", friendRoutes);
router.use("/challenges", challengeRoutes);
router.use("/quiz-sessions", quizSessionRoutes);

export default router;
