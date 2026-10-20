import express from "express";
import { sendContactEmail } from "../../controllers/contactController.js";
import { contactLimiter } from "../../middleware/rateLimiters.js";

const router = express.Router();

router.post("/", contactLimiter, sendContactEmail);

export default router;
