import express from "express";
import { logScore } from '../../controllers/scoreControllers.js';

const router = express.Router();

router.post('/logscore', logScore);


export default router;