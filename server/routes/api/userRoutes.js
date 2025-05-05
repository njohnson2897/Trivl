import express from "express";
import {
  register,
  login,
  getUsers,
  getUserById,
  searchUsers,
  checkUsername,
} from "../../controllers/userControllers.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/check-username/:username", checkUsername);
router.get("/", getUsers);
router.get("/search/:query", searchUsers);
router.get("/:id", getUserById);

export default router;
