import express from "express";
import {
  register,
  login,
  getUsers,
  getUserById,
  searchUsers,
  checkUsername,
  getUserSettings,
  updateUserSettings,
  getUserProfile,
  getCooldownStatus,
} from "../../controllers/userControllers.js";
import { authenticateToken } from "../../middleware/auth.js";
import { loginLimiter, registerLimiter } from "../../middleware/rateLimiters.js";

const router = express.Router();

// Public routes
router.post("/register", registerLimiter, register);
router.post("/login", loginLimiter, login);
router.get("/check-username/:username", checkUsername);

// Protected routes
router.get("/", authenticateToken, getUsers);
router.get("/search", authenticateToken, searchUsers);
// Settings routes must come before :id routes
router.get("/settings", authenticateToken, getUserSettings);
router.post("/settings", authenticateToken, updateUserSettings);
// Cooldown status route
router.get("/cooldown", authenticateToken, getCooldownStatus);
// Profile and user routes
router.get("/:id/profile", authenticateToken, getUserProfile);
router.get("/:id", authenticateToken, getUserById);

export default router;
