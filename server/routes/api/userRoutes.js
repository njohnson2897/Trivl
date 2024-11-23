import express from "express";
import { register, login, getUsers, getUserById } from '../../controllers/userControllers.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/', getUsers);
router.get('/:id', getUserById);


export default router;
