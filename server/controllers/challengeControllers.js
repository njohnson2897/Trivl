import { Challenge, User, UserFriends } from "../models/index.js";
import { fetchTriviaQuestions } from "../utils/trivia.js";
import { Op } from "sequelize";

// Never sent to the browser: quiz sessions serve the questions and grade the answers.
const HIDDEN_FIELDS = ["questions", "challengerAnswers", "challengedAnswers"];

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

    const questions = await fetchTriviaQuestions();

    const challenge = await Challenge.create({
      challengerId,
      challengedId,
      questions,
      status: "pending",
    });

    res.status(201).json({ challenge: { id: challenge.id } });
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
      attributes: { exclude: HIDDEN_FIELDS },
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

    res.status(200).json({ message: "Challenge accepted" });
  } catch (error) {
    console.error("Error accepting challenge:", error);
    res.status(500).json({ error: "Error accepting challenge" });
  }
};

// Get challenge details
export const getChallengeDetails = async (req, res) => {
  try {
    const { challengeId } = req.params;
    const userId = req.user.id;

    const challenge = await Challenge.findByPk(challengeId, {
      attributes: { exclude: HIDDEN_FIELDS },
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
