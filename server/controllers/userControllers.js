import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User, Score, Achievement } from "../models/index.js";
import { Op, QueryTypes } from "sequelize";
import sequelize from "../config/connection.js";
import { toDateCT } from "../utils/dates.js";
import { findFriends } from "./friendControllers.js";

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

// Per-mode totals for one player, computed by the database
const MODE_STATS_SQL = `
  SELECT quiz_mode AS mode,
    CAST(COUNT(*) AS int) AS "totalQuizzes",
    CAST(ROUND(AVG(quiz_score), 2) AS float) AS "averageScore",
    MAX(quiz_score) AS "bestScore",
    CAST(ROUND(AVG(COALESCE(time_taken, 0))) AS int) AS "averageTime",
    CAST(SUM(quiz_score) AS int) AS "totalCorrect"
  FROM score
  WHERE user_id = :userId
  GROUP BY quiz_mode`;
const PROFILE_MODES = ["daily", "blitz", "category", "survival", "challenge"];
const EMPTY_MODE_STATS = { totalQuizzes: 0, averageScore: 0, bestScore: 0, averageTime: 0, totalCorrect: 0 };

// GET user profile, respecting privacy settings
export const getUserProfile = async (req, res) => {
  try {
    const profileId = Number(req.params.id);
    const isOwnProfile = profileId === req.user.id;

    const user = await User.findByPk(profileId, {
      attributes: ["id", "username", "email", "createdAt", "isPublic"],
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const friends = await findFriends(profileId);
    const isFriend = friends.some((friend) => friend.id === req.user.id);

    // A private profile only shows its name to people who aren't friends
    if (!isOwnProfile && !isFriend && !user.isPublic) {
      return res.json({ id: user.id, username: user.username, isPublic: false, isFriend: false });
    }

    const [statRows, recentScores, achievements] = await Promise.all([
      sequelize.query(MODE_STATS_SQL, {
        replacements: { userId: profileId },
        type: QueryTypes.SELECT,
      }),
      Score.findAll({
        where: { user_id: profileId },
        order: [["date_taken", "DESC"]],
        limit: 5,
      }),
      Achievement.findAll({
        where: { user_id: profileId, date_achieved: { [Op.ne]: null } },
        attributes: ["name", "description", "icon", "date_achieved"],
        order: [["date_achieved", "DESC"]],
        limit: 3,
      }),
    ]);

    // Every mode appears, even ones the player hasn't tried yet
    const modeStats = Object.fromEntries(
      PROFILE_MODES.map((mode) => [
        mode,
        { ...EMPTY_MODE_STATS, ...statRows.find((row) => row.mode === mode) },
      ])
    );

    res.json({
      id: user.id,
      username: user.username,
      email: isOwnProfile ? user.email : undefined,
      createdAt: user.createdAt,
      isPublic: user.isPublic,
      isFriend,
      modeStats,
      recentScores: recentScores.map((score) => ({
        score: score.quiz_score,
        date: score.date_taken,
        difficulty: score.quiz_difficulty,
        time_taken: score.time_taken,
        quiz_mode: score.quiz_mode,
        category_name: score.category_name,
        opponent_username: score.opponent_username,
        won_challenge: score.won_challenge,
      })),
      friends,
      achievements,
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

    const todayDateCT = toDateCT();
    const lastQuizDateStr = user.lastQuizDate ? toDateCT(user.lastQuizDate) : null;

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
