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
} from "../../controllers/userControllers.js";
import { authenticateToken } from "../../middleware/auth.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.get("/check-username/:username", checkUsername);

// Protected routes
router.get("/", authenticateToken, getUsers);
router.get("/search", authenticateToken, searchUsers);
// Settings routes must come before :id routes
router.get("/settings", authenticateToken, getUserSettings);
router.post("/settings", authenticateToken, updateUserSettings);
// Profile and user routes
router.get("/:id/profile", authenticateToken, getUserProfile);
router.get("/:id", authenticateToken, getUserById);

export default router;
