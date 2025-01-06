import { Router } from 'express';
import userRoutes from './userRoutes.js';
import scoreRoutes from './scoreRoutes.js';
import friendRoutes from './friendRoutes.js';

const router = Router();

router.use('/users', userRoutes);
router.use('/scores', scoreRoutes)
router.use('/friends', friendRoutes);

export default router;