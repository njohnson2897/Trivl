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
  
      // Find all accepted friendships for the user
      const friendships = await UserFriends.findAll({
        where: {
          userId,
          status: 'accepted',
        },
        include: [
          {
            model: User,
            as: 'friend', // Use the alias defined in the relationship
            attributes: ['id', 'username', 'createdAt'],
          },
        ],
      });
  
      // Extract friend details
      const friends = friendships.map((friendship) => friendship.friend);
  
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
  
  