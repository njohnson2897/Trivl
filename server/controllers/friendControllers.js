import User from '../models/User.js';

// ADD FRIEND - POST
export const addFriend = async (req, res) => {
  try {
      const { userId, friendId } = req.body;
      
      // Convert IDs to integers to ensure type consistency
      const userIdInt = parseInt(userId);
      const friendIdInt = parseInt(friendId);
      
      // Get both users
      const user = await User.findByPk(userIdInt);
      const friend = await User.findByPk(friendIdInt);
      
      if (!user || !friend) {
          return res.status(404).json({ error: "One or both users not found" });
      }
      
      console.log('Initial user object:', user.toJSON());
      
      // Initialize friends array if it doesn't exist
      let friendsArray = Array.isArray(user.friends) ? user.friends : [];
      console.log('Current friends array:', friendsArray);
      
      if (!friendsArray.includes(friendIdInt)) {
          friendsArray.push(friendIdInt);
          console.log('New friends array:', friendsArray);
          
          // Try raw update
          const [updateCount, [updatedUser]] = await User.update(
              { friends: friendsArray },
              { 
                  where: { id: userIdInt },
                  returning: true
              }
          );
          
          console.log('Update count:', updateCount);
          console.log('Updated user:', updatedUser ? updatedUser.toJSON() : null);
          
          // Double check the update
          const finalCheck = await User.findByPk(userIdInt);
          console.log('Final check - user friends:', finalCheck.friends);
      }
      
      res.status(200).json({ message: "Friend added successfully" });
  } catch (error) {
      console.error("Error adding friend:", error);
      console.error("Error details:", {
          message: error.message,
          stack: error.stack
      });
      res.status(500).json({ error: "Error adding friend" });
  }
};

// GET FRIENDS - GET
export const getFriends = async (req, res) => {
  try {
      const { userId } = req.params;
      
      // Get the user
      const user = await User.findByPk(userId);
      console.log('User found:', user.id, user.username); // Log user details
      console.log('Friends array:', user.friends); // Log friends array
      
      if (!user) {
          return res.status(404).json({ error: "User not found" });
      }
      
      // Get all friend users
      const friendsArray = user.friends || [];
      console.log('Friends array before query:', friendsArray); // Log array before query
      
      const friends = await User.findAll({
          where: {
              id: friendsArray
          },
          attributes: ['id', 'username', 'createdAt']
      });
      
      console.log('Found friends:', friends); // Log found friends
      
      res.status(200).json({ friends });
  } catch (error) {
      console.error("Error fetching friends:", error);
      res.status(500).json({ error: "Error fetching friends" });
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
  
  