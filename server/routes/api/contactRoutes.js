import express from "express";
import { sendContactEmail } from "../../controllers/contactControllers.js";
import { contactLimiter } from "../../middleware/rateLimiters.js";

const router = express.Router();

router.post("/", contactLimiter, sendContactEmail);

export default router;
