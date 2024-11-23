import express from "express";
import { getScoresByUser, logScore } from '../../controllers/scoreControllers.js';


const router = express.Router();

router.post('/logscore', logScore);
router.get('/:userId', getScoresByUser)


export default router;