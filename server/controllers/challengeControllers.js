import { Challenge, User, UserFriends, Score } from "../models/index.js";
import { Op } from "sequelize";

// Create a new challenge
export const createChallenge = async (req, res) => {
  try {
    const { challengedId } = req.body;
    const challengerId = req.user.id;

    // Validate that the challenged user exists
    const challengedUser = await User.findByPk(challengedId);
    if (!challengedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Prevent self-challenge
    if (challengerId === challengedId) {
      return res.status(400).json({ error: "Cannot challenge yourself" });
    }

    // Verify friendship exists
    const friendship = await UserFriends.findOne({
      where: {
        [Op.or]: [
          { userId: challengerId, friendId: challengedId, status: "accepted" },
          { userId: challengedId, friendId: challengerId, status: "accepted" },
        ],
      },
    });

    if (!friendship) {
      return res.status(400).json({
        error: "You must be friends with this user to challenge them",
      });
    }

    // Fetch 10 random questions
    const response = await fetch(
      "https://the-trivia-api.com/api/questions?limit=10"
    );
    const questions = await response.json();

    if (!questions || questions.length === 0) {
      return res.status(500).json({ error: "Failed to fetch questions" });
    }

    // Create the challenge
    const challenge = await Challenge.create({
      challengerId,
      challengedId,
      questions: Array.isArray(questions)
        ? questions
        : questions.value || questions,
      status: "pending",
    });

    res.status(201).json({ challenge });
  } catch (error) {
    console.error("Error creating challenge:", error);
    res.status(500).json({ error: "Error creating challenge" });
  }
};

// Get pending challenges for the current user
export const getPendingChallenges = async (req, res) => {
  try {
    const userId = req.user.id;

    const challenges = await Challenge.findAll({
      where: {
        challengedId: userId,
        status: "pending",
      },
      include: [
        {
          model: User,
          as: "challenger",
          attributes: ["id", "username"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    res.status(200).json({ challenges });
  } catch (error) {
    console.error("Error fetching pending challenges:", error);
    res.status(500).json({ error: "Error fetching pending challenges" });
  }
};

// Get all challenges (pending, in_progress, completed) for the current user
export const getUserChallenges = async (req, res) => {
  try {
    const userId = req.user.id;

    const challenges = await Challenge.findAll({
      where: {
        [Op.or]: [{ challengerId: userId }, { challengedId: userId }],
      },
      include: [
        {
          model: User,
          as: "challenger",
          attributes: ["id", "username"],
        },
        {
          model: User,
          as: "challenged",
          attributes: ["id", "username"],
        },
        {
          model: User,
          as: "winner",
          attributes: ["id", "username"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    res.status(200).json({ challenges });
  } catch (error) {
    console.error("Error fetching challenges:", error);
    res.status(500).json({ error: "Error fetching challenges" });
  }
};

// Get completed challenges for the current user

// Accept a challenge (start the quiz)
export const acceptChallenge = async (req, res) => {
  try {
    const { challengeId } = req.params;
    const userId = req.user.id;

    const challenge = await Challenge.findOne({
      where: {
        id: challengeId,
        challengedId: userId,
        status: "pending",
      },
    });

    if (!challenge) {
      return res.status(404).json({ error: "Challenge not found" });
    }

    // Update challenge status
    await challenge.update({ status: "in_progress" });

    res.status(200).json({
      challenge,
      questions: challenge.questions,
    });
  } catch (error) {
    console.error("Error accepting challenge:", error);
    res.status(500).json({ error: "Error accepting challenge" });
  }
};

// Submit challenger's results
export const submitChallengerResults = async (req, res) => {
  try {
    const { challengeId } = req.params;
    const { score, timeTaken, answers } = req.body;
    const userId = req.user.id;

    const challenge = await Challenge.findOne({
      where: {
        id: challengeId,
        challengerId: userId,
      },
    });

    if (!challenge) {
      return res.status(404).json({ error: "Challenge not found" });
    }

    // Update challenger's results
    await challenge.update({
      challengerScore: score,
      challengerTimeTaken: timeTaken,
      challengerAnswers: Array.isArray(answers) ? answers : null,
    });

    res
      .status(200)
      .json({ message: "Results submitted successfully", challenge });
  } catch (error) {
    console.error("Error submitting challenger results:", error);
    res.status(500).json({ error: "Error submitting results" });
  }
};

// Submit challenged user's results and determine winner
export const submitChallengedResults = async (req, res) => {
  try {
    const { challengeId } = req.params;
    const { score, timeTaken, answers } = req.body;
    const userId = req.user.id;

    const challenge = await Challenge.findOne({
      where: {
        id: challengeId,
        challengedId: userId,
        status: "in_progress",
      },
    });

    if (!challenge) {
      return res.status(404).json({ error: "Challenge not found" });
    }

    // Update challenged user's results
    await challenge.update({
      challengedScore: score,
      challengedTimeTaken: timeTaken,
      challengedAnswers: Array.isArray(answers) ? answers : null,
    });

    // Determine winner
    let winnerId = null;
    const challengerScore = challenge.challengerScore;
    const challengedScore = score;
    const challengerTime = challenge.challengerTimeTaken;
    const challengedTime = timeTaken;

    if (challengerScore > challengedScore) {
      winnerId = challenge.challengerId;
    } else if (challengedScore > challengerScore) {
      winnerId = challenge.challengedId;
    } else {
      // Tie - winner based on time (lower time wins)
      if (challengerTime < challengedTime) {
        winnerId = challenge.challengerId;
      } else if (challengedTime < challengerTime) {
        winnerId = challenge.challengedId;
      }
      // If even tie in time, winner remains null (draw)
    }

    // Update challenge status
    await challenge.update({
      status: "completed",
      winnerId,
      completedAt: new Date(),
    });

    // Update both players' scores with win/loss status
    const wonChallenger = winnerId === challenge.challengerId;
    const wonChallenged = winnerId === challenge.challengedId;

    // Update challenger's score
    await Score.update(
      { won_challenge: wonChallenger },
      {
        where: {
          challenge_id: challengeId,
          user_id: challenge.challengerId,
        },
      }
    );

    // Update challenged player's score
    await Score.update(
      { won_challenge: wonChallenged },
      {
        where: {
          challenge_id: challengeId,
          user_id: challenge.challengedId,
        },
      }
    );

    // Get winner info if it exists
    let winner = null;
    if (challenge.winnerId) {
      winner = await User.findByPk(challenge.winnerId, {
        attributes: ["id", "username"],
      });
    }

    const updatedChallenge = await Challenge.findByPk(challengeId, {
      include: [
        {
          model: User,
          as: "challenger",
          attributes: ["id", "username"],
        },
        {
          model: User,
          as: "challenged",
          attributes: ["id", "username"],
        },
      ],
    });

    updatedChallenge.dataValues.winner = winner;

    res.status(200).json({
      message: "Results submitted successfully",
      challenge: updatedChallenge,
    });
  } catch (error) {
    console.error("Error submitting challenged results:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    res
      .status(500)
      .json({ error: `Error submitting results: ${error.message}` });
  }
};

// Get challenge details
export const getChallengeDetails = async (req, res) => {
  try {
    const { challengeId } = req.params;
    const userId = req.user.id;

    const challenge = await Challenge.findByPk(challengeId, {
      include: [
        {
          model: User,
          as: "challenger",
          attributes: ["id", "username"],
        },
        {
          model: User,
          as: "challenged",
          attributes: ["id", "username"],
        },
      ],
    });

    if (!challenge) {
      return res.status(404).json({ error: "Challenge not found" });
    }

    // Check if user is part of this challenge
    if (
      challenge.challengerId !== userId &&
      challenge.challengedId !== userId
    ) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Get winner info if challenge is completed
    if (challenge.winnerId) {
      const winner = await User.findByPk(challenge.winnerId, {
        attributes: ["id", "username"],
      });
      challenge.dataValues.winner = winner;
    }

    res.status(200).json({ challenge });
  } catch (error) {
    console.error("Error fetching challenge details:", error);
    res.status(500).json({ error: "Error fetching challenge details" });
  }
};
