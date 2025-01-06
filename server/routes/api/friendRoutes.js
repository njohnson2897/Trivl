import express from 'express';
import { addFriend, removeFriend, getFriends } from '../../controllers/friendControllers.js';


const router = express.Router();

router.post('/add', addFriend);       // Add a friend
router.post('/remove', removeFriend); // Remove a friend
router.get('/:userId', getFriends);  // Get friends list

export default router;