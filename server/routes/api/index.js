import { Router } from 'express';
import userRoutes from './userRoutes.js';
import scoreRoutes from './scoreRoutes.js';

const router = Router();

router.use('/users', userRoutes);
router.use('/scores', scoreRoutes)

export default router;