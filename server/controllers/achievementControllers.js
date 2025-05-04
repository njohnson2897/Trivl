import Achievement from "../models/Achievement.js";
import User from "../models/User.js";
import Score from "../models/Score.js";
import UserFriends from "../models/UserFriends.js";

// Define all possible achievements
const allAchievements = [
  {
    name: "Trivia Rookie",
    description: "Complete your first quiz",
    criteria: { type: "games_played", value: 1 },
    icon: "rookie",
  },
  {
    name: "High Scorer",
    description: "Score 8 or higher on a quiz",
    criteria: { type: "score", value: 8 },
    icon: "high-score",
  },
  {
    name: "Perfect Round",
    description: "Score 10/10 on a quiz",
    criteria: { type: "perfect_score", value: 1 },
    icon: "perfect",
  },
  {
    name: "Speed Demon",
    description: "Complete a quiz in under 30 seconds",
    criteria: { type: "time", value: 30 },
    icon: "speed",
  },
  {
    name: "Quiz Master",
    description: "Complete 10 quizzes",
    criteria: { type: "games_played", value: 10 },
    icon: "master",
  },
  {
    name: "Trivia Enthusiast",
    description: "Complete 25 quizzes",
    criteria: { type: "games_played", value: 25 },
    icon: "enthusiast",
  },
  {
    name: "Trivia Legend",
    description: "Complete 50 quizzes",
    criteria: { type: "games_played", value: 50 },
    icon: "legend",
  },
  {
    name: "Consistent Performer",
    description: "Maintain an average score of 8 or higher across 10 quizzes",
    criteria: { type: "average_score", value: 8 },
    icon: "consistent",
  },
  {
    name: "Perfect Streak",
    description: "Get 3 perfect scores in a row",
    criteria: { type: "perfect_streak", value: 3 },
    icon: "streak",
  },
  {
    name: "Quick Thinker",
    description: "Complete 5 quizzes in under 45 seconds each",
    criteria: { type: "quick_quizzes", value: 5 },
    icon: "quick",
  },
  {
    name: "Category Master",
    description: "Complete quizzes in 5 different categories",
    criteria: { type: "categories", value: 5 },
    icon: "category",
  },
  {
    name: "Night Owl",
    description: "Complete a quiz between 10 PM and 4 AM",
    criteria: { type: "night_quiz", value: 1 },
    icon: "night",
  },
  {
    name: "Early Bird",
    description: "Complete a quiz between 4 AM and 8 AM",
    criteria: { type: "morning_quiz", value: 1 },
    icon: "morning",
  },
  {
    name: "Weekend Warrior",
    description: "Complete 5 quizzes on weekends",
    criteria: { type: "weekend_quizzes", value: 5 },
    icon: "weekend",
  },
  {
    name: "Social Butterfly",
    description: "Add 5 friends to your friend list",
    criteria: { type: "friends", value: 5 },
    icon: "social",
  },
];

// Get all achievements for a user
export const getUserAchievements = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get user's achieved achievements
    const userAchievements = await Achievement.findAll({
      where: { user_id: userId },
      order: [["date_achieved", "DESC"]],
    });

    // Map all possible achievements, marking unachieved ones
    const achievements = allAchievements.map((achievement) => {
      const userAchievement = userAchievements.find(
        (a) => a.name === achievement.name
      );
      return {
        ...achievement,
        id: userAchievement?.id || null,
        user_id: userAchievement?.user_id || null,
        date_achieved: userAchievement?.date_achieved || null,
        achieved: !!userAchievement,
      };
    });

    res.status(200).json(achievements);
  } catch (error) {
    console.error("Error fetching user achievements:", error);
    res.status(500).json({ error: "Error fetching user achievements" });
  }
};

// Check and update achievements after a quiz completion
export const checkAchievements = async (userId) => {
  try {
    // Get user's scores
    const scores = await Score.findAll({
      where: { user_id: userId },
      order: [["date_taken", "DESC"]],
    });

    // Calculate statistics
    const totalGames = scores.length;
    const perfectScores = scores.filter(
      (score) => score.quiz_score === 10
    ).length;
    const fastestTime = Math.min(...scores.map((score) => score.time_taken));

    // Calculate additional statistics
    const recentScores = scores.slice(0, 10); // Last 10 scores
    const recentAverage =
      recentScores.length > 0
        ? recentScores.reduce((sum, score) => sum + score.quiz_score, 0) /
          recentScores.length
        : 0;

    const quickQuizzes = scores.filter(
      (score) => score.time_taken <= 45
    ).length;
    const uniqueCategories = new Set(
      scores.map((score) => score.categories).flat()
    ).size;

    const weekendQuizzes = scores.filter((score) => {
      const date = new Date(score.date_taken);
      return date.getDay() === 0 || date.getDay() === 6;
    }).length;

    // Get user's friend count using UserFriends model
    const friendCount = await UserFriends.count({
      where: { userId: userId },
    });

    // Check each achievement
    const achievementChecks = [
      {
        name: "Trivia Rookie",
        achieved: totalGames >= 1,
      },
      {
        name: "High Scorer",
        achieved: scores.some((score) => score.quiz_score >= 8),
      },
      {
        name: "Perfect Round",
        achieved: perfectScores >= 1,
      },
      {
        name: "Speed Demon",
        achieved: fastestTime <= 30,
      },
      {
        name: "Quiz Master",
        achieved: totalGames >= 10,
      },
      {
        name: "Trivia Enthusiast",
        achieved: totalGames >= 25,
      },
      {
        name: "Trivia Legend",
        achieved: totalGames >= 50,
      },
      {
        name: "Consistent Performer",
        achieved: recentAverage >= 8 && recentScores.length >= 10,
      },
      {
        name: "Perfect Streak",
        achieved: scores.slice(0, 3).every((score) => score.quiz_score === 10),
      },
      {
        name: "Quick Thinker",
        achieved: quickQuizzes >= 5,
      },
      {
        name: "Category Master",
        achieved: uniqueCategories >= 5,
      },
      {
        name: "Night Owl",
        achieved: scores.some((score) => {
          const hour = new Date(score.date_taken).getHours();
          return hour >= 22 || hour < 4;
        }),
      },
      {
        name: "Early Bird",
        achieved: scores.some((score) => {
          const hour = new Date(score.date_taken).getHours();
          return hour >= 4 && hour < 8;
        }),
      },
      {
        name: "Weekend Warrior",
        achieved: weekendQuizzes >= 5,
      },
      {
        name: "Social Butterfly",
        achieved: friendCount >= 5,
      },
    ];

    // Create new achievements
    for (const check of achievementChecks) {
      const existingAchievement = await Achievement.findOne({
        where: {
          user_id: userId,
          name: check.name,
        },
      });

      if (!existingAchievement && check.achieved) {
        const achievement = allAchievements.find((a) => a.name === check.name);
        await Achievement.create({
          user_id: userId,
          name: achievement.name,
          description: achievement.description,
          criteria: achievement.criteria,
          icon: achievement.icon,
          date_achieved: new Date(),
        });
      }
    }
  } catch (error) {
    console.error("Error checking achievements:", error);
  }
};
