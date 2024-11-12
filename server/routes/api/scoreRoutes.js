import express from "express";
import { logScore } from '../../controllers/scoreControllers';

const router = express.Router();

router.post('/logscore', logScore);


export default router;