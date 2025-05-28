import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User, Score, UserFriends } from "../models/index.js";
import { Op } from "sequelize";

// Register controller - POST
export const register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    const user = await User.create({
      username,
      email, // Include email here
      password: hashedPassword,
      quizScores: [], // Default value
      friends: [], // Default value
    });

    // Sign a JWT for the new user
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });

    // Return user info (without password) and the token
    res.status(201).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email, // Include email in response
        createdAt: user.createdAt,
        quizScores: user.quizScores,
        friends: user.friends,
      },
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error registering user" });
  }
};

// Login controller - POST
export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find the user by username
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    // Compare provided password with stored hash
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: "Invalid password" });
    }

    // Generate a JWT token for the authenticated user
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });

    // Return user info (without password) and the token
    res.json({
      user: { id: user.id, username: user.username },
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error logging in" });
  }
};

// GET all users
export const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      include: [
        {
          model: Score,
          attributes: ["quiz_score", "time_taken", "date_taken"],
        },
      ],
    });
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Error fetching users" });
  }
};

// GET user by ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Error fetching user" });
  }
};

// search users - GET
export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    const currentUserId = req.user.id; // Get current user's ID from auth middleware

    const users = await User.findAll({
      where: {
        username: {
          [Op.iLike]: `%${query}%`, // Case-insensitive search
        },
        id: {
          [Op.ne]: currentUserId, // Exclude current user
        },
      },
      attributes: ["id", "username", "createdAt"], // Only return necessary fields
    });

    res.status(200).json({ users });
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ error: "Error searching users" });
  }
};

// Check username availability - GET
export const checkUsername = async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ where: { username } });
    res.json({ available: !user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error checking username availability" });
  }
};

// GET user profile with privacy controls
export const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user.id; // From auth middleware

    // Check if this is the user's own profile
    const isOwnProfile = parseInt(id) === parseInt(currentUserId);

    // Get the user's profile
    const user = await User.findByPk(id, {
      include: [
        {
          model: Score,
          attributes: ["quiz_score", "time_taken", "date_taken"],
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get user's friends
    const friends = await UserFriends.findAll({
      where: {
        [Op.or]: [
          { userId: parseInt(id), status: "accepted" },
          { friendId: parseInt(id), status: "accepted" },
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

    // Transform friends list to get friend details
    const friendsList = friends.map((friendship) => {
      const friend =
        friendship.userId === parseInt(id)
          ? friendship.friend
          : friendship.user;
      return {
        id: friend.id,
        username: friend.username,
        createdAt: friend.createdAt,
      };
    });

    // Check if the current user is friends with the profile owner
    const friendship = await UserFriends.findOne({
      where: {
        [Op.or]: [
          {
            userId: parseInt(currentUserId),
            friendId: parseInt(id),
            status: "accepted",
          },
          {
            userId: parseInt(id),
            friendId: parseInt(currentUserId),
            status: "accepted",
          },
        ],
      },
    });

    console.log("Profile check:", {
      profileId: id,
      currentUserId,
      isOwnProfile,
      isPublic: user.isPublic,
      friendship: friendship ? true : false,
    });

    // If not own profile and not a friend, check if profile is public
    if (!isOwnProfile && !friendship && !user.isPublic) {
      return res.status(200).json({
        id: user.id,
        username: user.username,
        isPublic: user.isPublic,
        isFriend: false,
      });
    }

    // Calculate statistics
    const scores = user.Scores || [];
    const totalQuizzes = scores.length;
    const averageScore =
      totalQuizzes > 0
        ? scores.reduce((acc, score) => acc + score.quiz_score, 0) /
          totalQuizzes
        : 0;
    const highestScore =
      totalQuizzes > 0
        ? Math.max(...scores.map((score) => score.quiz_score))
        : 0;

    // Return full profile data
    res.status(200).json({
      id: user.id,
      username: user.username,
      email: isOwnProfile ? user.email : undefined,
      createdAt: user.createdAt,
      isPublic: user.isPublic,
      isFriend: !!friendship,
      totalQuizzes,
      averageScore: Math.round(averageScore),
      highestScore,
      recentScores: scores.slice(-5).map((score) => ({
        score: score.quiz_score,
        date: score.date_taken,
      })),
      friends: friendsList,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: "Error fetching user profile" });
  }
};

// GET user settings
export const getUserSettings = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      theme: user.theme || "light",
      notifications: user.notifications ?? true,
      emailNotifications: user.emailNotifications ?? true,
      soundEnabled: user.soundEnabled ?? true,
      difficulty: user.difficulty || "medium",
      language: user.language || "english",
      isPublic: user.isPublic ?? false,
      shareScores: user.shareScores ?? true,
      showOnline: user.showOnline ?? true,
    });
  } catch (error) {
    console.error("Error fetching user settings:", error);
    res.status(500).json({ error: "Error fetching user settings" });
  }
};

// UPDATE user settings
export const updateUserSettings = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware
    const {
      theme,
      notifications,
      emailNotifications,
      soundEnabled,
      difficulty,
      language,
      isPublic,
      shareScores,
      showOnline,
    } = req.body;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update user settings
    await user.update({
      theme,
      notifications,
      emailNotifications,
      soundEnabled,
      difficulty,
      language,
      isPublic,
      shareScores,
      showOnline,
    });

    res.status(200).json({
      message: "Settings updated successfully",
      settings: {
        theme,
        notifications,
        emailNotifications,
        soundEnabled,
        difficulty,
        language,
        isPublic,
        shareScores,
        showOnline,
      },
    });
  } catch (error) {
    console.error("Error updating user settings:", error);
    res.status(500).json({ error: "Error updating user settings" });
  }
};
