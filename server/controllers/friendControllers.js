import { Op } from "sequelize";
import { UserFriends, User } from "../models/index.js";

/** Everyone with an accepted friendship with this user, in either direction. */
export const findFriends = async (userId) => {
  const friendships = await UserFriends.findAll({
    where: {
      status: "accepted",
      [Op.or]: [{ userId }, { friendId: userId }],
    },
    include: [
      { model: User, as: "user", attributes: ["id", "username", "createdAt"] },
      { model: User, as: "friend", attributes: ["id", "username", "createdAt"] },
    ],
  });
  return friendships
    .map((f) => (f.userId === userId ? f.friend : f.user))
    .map(({ id, username, createdAt }) => ({ id, username, createdAt }));
};

/** A pending request sent *to* this user, or null. */
const findPendingRequest = (requestId, userId) =>
  UserFriends.findOne({ where: { id: requestId, friendId: userId, status: "pending" } });

// POST /api/friends/add  { friendId }
export const sendFriendRequest = async (req, res) => {
  const userId = req.user.id;
  const friendId = Number(req.body.friendId);

  if (friendId === userId) {
    return res.status(400).json({ error: "Cannot send friend request to yourself" });
  }

  try {
    if (!(await User.findByPk(friendId))) {
      return res.status(404).json({ error: "User not found" });
    }

    const existing = await UserFriends.findOne({
      where: {
        [Op.or]: [
          { userId, friendId },
          { userId: friendId, friendId: userId },
        ],
      },
    });
    if (existing) {
      return res.status(400).json({ error: "Friend request already exists or you are already friends" });
    }

    const friendRequest = await UserFriends.create({ userId, friendId, status: "pending" });
    res.status(201).json({ message: "Friend request sent", friendRequest });
  } catch (error) {
    console.error("Error sending friend request:", error);
    res.status(500).json({ error: "Error sending friend request" });
  }
};

// POST /api/friends/accept/:requestId
export const acceptFriendRequest = async (req, res) => {
  try {
    const request = await findPendingRequest(req.params.requestId, req.user.id);
    if (!request) {
      return res.status(404).json({ error: "Friend request not found" });
    }
    await request.update({ status: "accepted" });
    res.json({ message: "Friend request accepted" });
  } catch (error) {
    console.error("Error accepting friend request:", error);
    res.status(500).json({ error: "Error accepting friend request" });
  }
};

// POST /api/friends/reject/:requestId
export const rejectFriendRequest = async (req, res) => {
  try {
    const request = await findPendingRequest(req.params.requestId, req.user.id);
    if (!request) {
      return res.status(404).json({ error: "Friend request not found" });
    }
    await request.destroy();
    res.json({ message: "Friend request rejected" });
  } catch (error) {
    console.error("Error rejecting friend request:", error);
    res.status(500).json({ error: "Error rejecting friend request" });
  }
};

// GET /api/friends/requests  (requests waiting on the current user)
export const getFriendRequests = async (req, res) => {
  try {
    const friendRequests = await UserFriends.findAll({
      where: { friendId: req.user.id, status: "pending" },
      include: [{ model: User, as: "user", attributes: ["id", "username"] }],
    });
    res.json({ friendRequests });
  } catch (error) {
    console.error("Error fetching friend requests:", error);
    res.status(500).json({ error: "Error fetching friend requests" });
  }
};

// GET /api/friends/list
export const getFriendsList = async (req, res) => {
  try {
    res.json({ friends: await findFriends(req.user.id) });
  } catch (error) {
    console.error("Error fetching friends list:", error);
    res.status(500).json({ error: "Error fetching friends list" });
  }
};