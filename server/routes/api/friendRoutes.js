import express from "express";
import { authenticateToken } from "../../middleware/auth.js";
import { UserFriends, User } from "../../models/index.js";
import { Op } from "sequelize";

const router = express.Router();

// Send friend request
router.post("/add", authenticateToken, async (req, res) => {
  try {
    const { friendId } = req.body;
    const userId = req.user.id;

    // Validate that the current user exists
    const currentUser = await User.findByPk(userId);
    if (!currentUser) {
      return res.status(401).json({
        error: "Invalid user token. Please log in again.",
      });
    }

    // Validate that the friend user exists
    const friendUser = await User.findByPk(friendId);
    if (!friendUser) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    // Prevent self-friending
    if (userId === friendId) {
      return res.status(400).json({
        error: "Cannot send friend request to yourself",
      });
    }

    // Check if friend request already exists
    const existingRequest = await UserFriends.findOne({
      where: {
        [Op.or]: [
          { userId, friendId },
          { userId: friendId, friendId: userId },
        ],
      },
    });

    if (existingRequest) {
      return res.status(400).json({
        error: "Friend request already exists or you are already friends",
      });
    }

    // Create new friend request
    const friendRequest = await UserFriends.create({
      userId,
      friendId,
      status: "pending",
    });

    res.status(201).json({ message: "Friend request sent", friendRequest });
  } catch (error) {
    console.error("Error sending friend request:", error);
    res.status(500).json({ error: "Error sending friend request" });
  }
});

// Accept friend request
router.post("/accept/:requestId", authenticateToken, async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.id;

    // Validate that the current user exists
    const currentUser = await User.findByPk(userId);
    if (!currentUser) {
      return res.status(401).json({
        error: "Invalid user token. Please log in again.",
      });
    }

    const friendRequest = await UserFriends.findOne({
      where: {
        id: requestId,
        friendId: userId,
        status: "pending",
      },
    });

    if (!friendRequest) {
      return res.status(404).json({ error: "Friend request not found" });
    }

    await friendRequest.update({ status: "accepted" });
    res.status(200).json({ message: "Friend request accepted" });
  } catch (error) {
    console.error("Error accepting friend request:", error);
    res.status(500).json({ error: "Error accepting friend request" });
  }
});

// Reject friend request
router.post("/reject/:requestId", authenticateToken, async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.id;

    // Validate that the current user exists
    const currentUser = await User.findByPk(userId);
    if (!currentUser) {
      return res.status(401).json({
        error: "Invalid user token. Please log in again.",
      });
    }

    const friendRequest = await UserFriends.findOne({
      where: {
        id: requestId,
        friendId: userId,
        status: "pending",
      },
    });

    if (!friendRequest) {
      return res.status(404).json({ error: "Friend request not found" });
    }

    await friendRequest.destroy();
    res.status(200).json({ message: "Friend request rejected" });
  } catch (error) {
    console.error("Error rejecting friend request:", error);
    res.status(500).json({ error: "Error rejecting friend request" });
  }
});

// Get friend requests
router.get("/requests", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("🔍 GET /api/friends/requests - User ID:", userId);

    // Validate that the current user exists
    const currentUser = await User.findByPk(userId);
    if (!currentUser) {
      console.log("❌ User not found for ID:", userId);
      return res.status(401).json({
        error: "Invalid user token. Please log in again.",
      });
    }

    const friendRequests = await UserFriends.findAll({
      where: {
        friendId: userId,
        status: "pending",
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "username"],
        },
      ],
    });

    console.log("🔍 Found friend requests:", friendRequests.length);
    console.log(
      "🔍 Friend requests data:",
      friendRequests.map((r) => ({
        id: r.id,
        from: r.user?.username,
        to: r.friendId,
      }))
    );

    res.status(200).json({ friendRequests });
  } catch (error) {
    console.error("Error fetching friend requests:", error);
    res.status(500).json({ error: "Error fetching friend requests" });
  }
});

// Get friends list
router.get("/list", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Validate that the current user exists
    const currentUser = await User.findByPk(userId);
    if (!currentUser) {
      return res.status(401).json({
        error: "Invalid user token. Please log in again.",
      });
    }

    const friends = await UserFriends.findAll({
      where: {
        [Op.or]: [
          { userId, status: "accepted" },
          { friendId: userId, status: "accepted" },
        ],
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "username", "createdAt"],
        },
        {
          model: User,
          as: "friend",
          attributes: ["id", "username", "createdAt"],
        },
      ],
    });

    // Transform the response to get friend details
    const friendsList = friends.map((friendship) => {
      const friend =
        friendship.userId === userId ? friendship.friend : friendship.user;
      return {
        id: friend.id,
        username: friend.username,
        createdAt: friend.createdAt,
      };
    });

    res.status(200).json({ friends: friendsList });
  } catch (error) {
    console.error("Error fetching friends list:", error);
    res.status(500).json({ error: "Error fetching friends list" });
  }
});

export default router;
