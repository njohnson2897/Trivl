import User from '../models/User.js';

// ADD FRIEND - POST
export const addFriend = async (req, res) => {
    try {
      const { userId, friendId } = req.body;
  
      // Check if both users exist
      const user = await User.findByPk(userId);
      const friend = await User.findByPk(friendId);
  
      if (!user || !friend) {
        return res.status(404).json({ error: "One or both users not found" });
      }
  
      // Add the friend
      await user.addFriend(friend);
  
      res.status(200).json({ message: "Friend added successfully" });
    } catch (error) {
      console.error("Error adding friend:", error);
      res.status(500).json({ error: "Error adding friend" });
    }
  };

// REMOVE FRIEND - POST
export const removeFriend = async (req, res) => {
    try {
      const { userId, friendId } = req.body;
  
      // Check if both users exist
      const user = await User.findByPk(userId);
      const friend = await User.findByPk(friendId);
  
      if (!user || !friend) {
        return res.status(404).json({ error: "One or both users not found" });
      }
  
      // Remove the friend
      await user.removeFriend(friend);
  
      res.status(200).json({ message: "Friend removed successfully" });
    } catch (error) {
      console.error("Error removing friend:", error);
      res.status(500).json({ error: "Error removing friend" });
    }
  };
  

// FETCH FRIENDS BY USER - GET
export const getFriends = async (req, res) => {
    try {
      const { userId } = req.params;
  
      // Check if the user exists
      const user = await User.findByPk(userId, {
        include: {
          model: User,
          as: 'friends', // Use the alias we defined earlier
          attributes: ['id', 'username', 'createdAt'], // Return relevant fields
          through: { attributes: [] }, // Exclude join table data
        },
      });
  
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
      res.status(200).json({ friends: user.friends });
    } catch (error) {
      console.error("Error fetching friends:", error);
      res.status(500).json({ error: "Error fetching friends" });
    }
  };
  
  