import { User, UserFriends } from '../models/index.js';

// ADD FRIENDS - POST
export const addFriend = async (req, res) => {
  try {
    const { userId, friendId } = req.body;

    // Check if the friendship already exists
    const existingFriendship = await UserFriends.findOne({
      where: {
        userId,
        friendId,
      },
    });

    if (existingFriendship) {
      return res.status(400).json({ error: 'Friendship already exists' });
    }

    // Create the friendship
    await UserFriends.create({
      userId,
      friendId,
      status: 'pending', // Default status
    });

    res.status(200).json({ message: 'Friend request sent successfully' });
  } catch (error) {
    console.error('Error adding friend:', error);
    res.status(500).json({ error: 'Error adding friend' });
  }
};

// GET FRIENDS - GET
export const getFriends = async (req, res) => {
    try {
      const { userId } = req.params;
  
      // Find the user and include their friends
      const user = await User.findByPk(userId, {
        include: [
          {
            model: User,
            as: 'friends', // Use the alias defined in the association
            attributes: ['id', 'username', 'createdAt'],
            through: { attributes: [] }, // Exclude join table attributes
          },
        ],
      });
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      // Extract friends from the user object
      const friends = user.friends;
  
      res.status(200).json({ friends });
    } catch (error) {
      console.error('Error fetching friends:', error);
      res.status(500).json({ error: 'Error fetching friends' });
    }
  };

// REMOVE FRIEND - UPDATE
export const removeFriend = async (req, res) => {
  try {
      const { userId, friendId } = req.body;
      
      // Get the user
      const user = await User.findByPk(userId);
      
      if (!user) {
          return res.status(404).json({ error: "User not found" });
      }
      
      // Remove friendId from friends array
      let friendsArray = user.friends || [];
      friendsArray = friendsArray.filter(id => id !== friendId);
      await user.update({ friends: friendsArray });
      
      res.status(200).json({ message: "Friend removed successfully" });
  } catch (error) {
      console.error("Error removing friend:", error);
      res.status(500).json({ error: "Error removing friend" });
  }
};

// get pending requests - GET
export const getPendingRequests = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('Fetching pending requests for user:', userId);

    const pendingRequests = await UserFriends.findAll({
      where: {
        friendId: userId,
        status: 'pending',
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username'],
        },
      ],
    });

    console.log('Pending requests:', pendingRequests);
    res.status(200).json({ requests: pendingRequests });
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({ error: 'Error fetching pending requests' });
  }
};

// accept friend request - UPDATE
export const acceptFriendRequest = async (req, res) => {
  try {
    const { userId, friendId } = req.body;

    // Find the pending friend request
    const friendship = await UserFriends.findOne({
      where: {
        userId: friendId, // The friend sent the request
        friendId: userId, // The current user is the recipient
        status: 'pending',
      },
    });

    if (!friendship) {
      return res.status(404).json({ error: 'Friend request not found' });
    }

    // Update the status to 'accepted'
    await friendship.update({ status: 'accepted' });

    res.status(200).json({ message: 'Friend request accepted' });
  } catch (error) {
    console.error('Error accepting friend request:', error);
    res.status(500).json({ error: 'Error accepting friend request' });
  }
};
  
// decline friend request - DELETE
export const declineFriendRequest = async (req, res) => {
  try {
    const { userId, friendId } = req.body;

    // Find the pending friend request
    const friendship = await UserFriends.findOne({
      where: {
        userId: friendId, // The friend sent the request
        friendId: userId, // The current user is the recipient
        status: 'pending',
      },
    });

    if (!friendship) {
      return res.status(404).json({ error: 'Friend request not found' });
    }

    // Delete the friend request
    await friendship.destroy();

    res.status(200).json({ message: 'Friend request declined' });
  } catch (error) {
    console.error('Error declining friend request:', error);
    res.status(500).json({ error: 'Error declining friend request' });
  }
};
  