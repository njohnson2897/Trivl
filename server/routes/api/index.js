import express from "express";
import userRoutes from "./userRoutes.js";
import scoreRoutes from "./scoreRoutes.js";
import contactRoutes from "./contactRoutes.js";
import achievementRoutes from "./achievementRoutes.js";
import friendRoutes from "./friendRoutes.js";

const router = express.Router();

router.use("/users", userRoutes);
router.use("/scores", scoreRoutes);
router.use("/contact", contactRoutes);
router.use("/achievements", achievementRoutes);
router.use("/friends", friendRoutes);

export default router;
