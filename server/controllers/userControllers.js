import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User, Score, UserFriends, Achievement } from "../models/index.js";
import { Op } from "sequelize";

const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,30}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 72; // bcrypt ignores everything past 72 bytes

/** Returns an error message for invalid registration input, or null. */
const validateRegistration = ({ username, email, password }) => {
  if (typeof username !== "string" || !USERNAME_PATTERN.test(username)) {
    return "Username must be 3–30 characters: letters, numbers, or underscores.";
  }
  if (typeof email !== "string" || email.length > 254 || !EMAIL_PATTERN.test(email)) {
    return "Please enter a valid email address.";
  }
  if (
    typeof password !== "string" ||
    password.length < MIN_PASSWORD_LENGTH ||
    password.length > MAX_PASSWORD_LENGTH
  ) {
    return `Password must be ${MIN_PASSWORD_LENGTH}–${MAX_PASSWORD_LENGTH} characters.`;
  }
  return null;
};

// Register controller - POST
export const register = async (req, res) => {
  const validationError = validateRegistration(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const { username, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashedPassword });

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.status(201).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res
        .status(409)
        .json({ error: "That username or email is already in use." });
    }
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Error registering user" });
  }
};


const INVALID_CREDENTIALS = "Invalid username or password";

// Login controller - POST
export const login = async (req, res) => {
  const { username, password } = req.body;

  if (typeof username !== "string" || typeof password !== "string") {
    return res.status(400).json({ error: "Username and password are required." });
  }

  try {
    const user = await User.scope("withPassword").findOne({ where: { username } });

    // Same response for an unknown username and a wrong password, so the
    // form doesn't confirm which one was wrong.
    const isValid = user && (await bcrypt.compare(password, user.password));
    if (!isValid) {
      return res.status(401).json({ error: INVALID_CREDENTIALS });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({ user: { id: user.id, username: user.username }, token });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Error logging in" });
  }
};

// GET all users
export const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "username"],
      include: [
        {
          model: Score,
          as: "Scores",
          attributes: [
            "quiz_score",
            "time_taken",
            "date_taken",
            "quiz_mode",
            "quiz_difficulty",
            "category_name",
            "categories",
          ],
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
    const user = await User.findByPk(id, {
      attributes: ["id", "username", "createdAt", "isPublic"],
    });

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
          as: "Scores",
          attributes: [
            "quiz_score",
            "time_taken",
            "date_taken",
            "quiz_difficulty",
            "quiz_mode",
            "category_name",
            "challenge_id",
            "opponent_id",
            "opponent_username",
            "won_challenge",
          ],
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Debug: Try a direct query to see if there are any scores
    const directScores = await Score.findAll({
      where: { user_id: parseInt(id) },
    });
    console.log("Direct scores query result:", directScores);
    console.log("Direct scores count:", directScores.length);

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

    // Get user's achievements
    const achievements = await Achievement.findAll({
      where: {
        user_id: parseInt(id),
        date_achieved: {
          [Op.ne]: null, // Only get achieved achievements
        },
      },
      order: [["date_achieved", "DESC"]],
      limit: 3, // Get the 3 most recent achievements
    });

    // Calculate statistics
    const scores = user.Scores || [];
    console.log("User scores from database:", scores);
    console.log("User ID:", id);
    console.log("Scores array length:", scores.length);

    const totalQuizzes = scores.length;

    // Calculate mode-specific statistics
    const modeStats = {};
    const modes = ["daily", "blitz", "category", "survival", "challenge"];

    modes.forEach((mode) => {
      const modeScores = scores.filter((s) => s.quiz_mode === mode);
      const count = modeScores.length;

      modeStats[mode] = {
        totalQuizzes: count,
        averageScore:
          count > 0
            ? parseFloat(
                (
                  modeScores.reduce((acc, s) => acc + s.quiz_score, 0) / count
                ).toFixed(2)
              )
            : 0,
        bestScore:
          count > 0 ? Math.max(...modeScores.map((s) => s.quiz_score)) : 0,
        averageTime:
          count > 0
            ? Math.round(
                modeScores.reduce((acc, s) => acc + (s.time_taken || 0), 0) /
                  count
              )
            : 0,
        totalCorrect: modeScores.reduce((acc, s) => acc + s.quiz_score, 0),
      };
    });

    // Overall statistics (amalgamated)
    const averageScore =
      totalQuizzes > 0
        ? scores.reduce((acc, score) => acc + score.quiz_score, 0) /
          totalQuizzes
        : 0;
    const highestScore =
      totalQuizzes > 0
        ? Math.max(...scores.map((score) => score.quiz_score))
        : 0;
    const averageDuration =
      totalQuizzes > 0
        ? scores.reduce((acc, score) => acc + (score.time_taken || 0), 0) /
          totalQuizzes
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
      averageDuration: Math.round(averageDuration),
      modeStats, // Add mode-specific statistics
      recentScores: scores
        .sort((a, b) => new Date(b.date_taken) - new Date(a.date_taken))
        .slice(0, 5)
        .map((score) => ({
          score: score.quiz_score,
          date: score.date_taken,
          difficulty: score.quiz_difficulty,
          time_taken: score.time_taken,
          quiz_mode: score.quiz_mode,
          category_name: score.category_name,
          challenge_id: score.challenge_id,
          opponent_id: score.opponent_id,
          opponent_username: score.opponent_username,
          won_challenge: score.won_challenge,
        })),
      friends: friendsList,
      achievements: achievements.map((achievement) => ({
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        date_achieved: achievement.date_achieved,
      })),
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
      theme, // Destructure but don't use (handled by frontend)
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

    // Update user settings (excluding theme which is managed by frontend)
    await user.update({
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

// Helper function to get today's date in Central Time (YYYY-MM-DD)
const getTodayDateCT = () => {
  const today = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(today);
  const year = parts.find((p) => p.type === "year").value;
  const month = parts.find((p) => p.type === "month").value;
  const day = parts.find((p) => p.type === "day").value;
  return `${year}-${month}-${day}`;
};

// Helper function to calculate milliseconds until next midnight CT
const getTimeUntilMidnightCT = () => {
  const now = new Date();

  // Get current time components in CT timezone
  const ctFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const ctTime = ctFormatter.format(now);
  const [hours, minutes, seconds] = ctTime.split(":").map(Number);

  // Calculate seconds until midnight CT
  const secondsUntilMidnight =
    24 * 60 * 60 - (hours * 60 * 60 + minutes * 60 + seconds);

  return secondsUntilMidnight * 1000; // Convert to milliseconds
};

// GET user cooldown status
export const getCooldownStatus = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const todayDateCT = getTodayDateCT();
    const lastQuizDateStr = user.lastQuizDate
      ? new Date(user.lastQuizDate)
          .toLocaleDateString("en-US", {
            timeZone: "America/Chicago",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          })
          .split("/")
          .reverse()
          .join("-")
          .replace(/(\d+)-(\d+)-(\d+)/, "$1-$3-$2")
      : null;

    let cooldownStatus = {
      canTakeQuiz: true,
      timeRemaining: 0,
      nextQuizTime: null,
      lastQuizDate: user.lastQuizDate,
    };

    // Check if user has taken a quiz today (in CT timezone)
    if (lastQuizDateStr === todayDateCT) {
      cooldownStatus.canTakeQuiz = false;

      // Calculate time until midnight CT
      cooldownStatus.timeRemaining = getTimeUntilMidnightCT();

      // Calculate next quiz time (midnight CT)
      const nextQuizTime = new Date(Date.now() + cooldownStatus.timeRemaining);
      cooldownStatus.nextQuizTime = nextQuizTime.toISOString();
    }

    res.status(200).json(cooldownStatus);
  } catch (error) {
    console.error("Error checking cooldown status:", error);
    res.status(500).json({ error: "Error checking cooldown status" });
  }
};
