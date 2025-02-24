import express from 'express';
import { addFriend, removeFriend, getFriends } from '../../controllers/friendControllers.js';

const router = express.Router();

router.post('/', addFriend); // Add a friend
router.delete('/:userId/:friendId', removeFriend); // Remove a friend
router.get('/:userId', getFriends); // Get friends list

export default router;