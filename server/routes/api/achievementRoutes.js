import express from "express";
import { getUserAchievements } from "../../controllers/achievementControllers.js";

const router = express.Router();

// GET all achievements for a user
router.get("/:userId", getUserAchievements);

export default router;
