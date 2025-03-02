import express from 'express';
import { 
  addFriend, 
  removeFriend, 
  getFriends, 
  acceptFriendRequest, 
  declineFriendRequest, 
  getPendingRequests 
} from '../../controllers/friendControllers.js';

const router = express.Router();

router.post('/', addFriend); // Add a friend
router.delete('/:userId/:friendId', removeFriend); // Remove a friend
router.get('/:userId', getFriends); // Get friends list
router.post('/accept', acceptFriendRequest); // Accept friend request
router.post('/decline', declineFriendRequest); // Decline friend request
router.get('/pending/:userId', getPendingRequests); // Get pending friend requests

export default router;