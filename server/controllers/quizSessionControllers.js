import { QuizSession, DailyQuestions, Score, User } from "../models/index.js";
import { fetchTriviaQuestions } from "../utils/trivia.js";
import { toDateCT } from "../utils/dates.js";
import { checkAchievements } from "./achievementControllers.js";

const SOLO_MODES = ["daily", "blitz", "category", "survival", "zen"];
const BLITZ_TIME_LIMITS = [30, 60, 120, 180]; // seconds
const SURVIVAL_SECONDS_PER_QUESTION = 15;
const SURVIVAL_BATCH_SIZE = 50;
const GRACE_MS = 2000; // allowance for network lag on timed answers

// --- Helpers ---------------------------------------------------------------

/** Everyone gets the same daily questions; fetch them once per day. */
const getDailyQuestions = async (date) => {
  const existing = await DailyQuestions.findOne({ where: { date } });
  if (existing) return existing.questions;

  const questions = await fetchTriviaQuestions();
  await DailyQuestions.create({ date, questions });
  return questions;
};

const shuffle = (items) => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

/** Milliseconds left on the clock, or null for untimed modes. */
const getTimeRemaining = (session) => {
  if (session.mode === "blitz") {
    return session.started_at.getTime() + session.settings.timeLimit * 1000 - Date.now();
  }
  if (session.mode === "survival") {
    return (
      session.question_started_at.getTime() +
      SURVIVAL_SECONDS_PER_QUESTION * 1000 -
      Date.now()
    );
  }
  return null;
};

/** What the browser is allowed to see: never a correct answer before the end. */
const toClientState = (session) => {
  const base = { id: session.id, mode: session.mode, settings: session.settings };

  if (session.finished_at) {
    const asked = session.questions.slice(0, session.answers.length);
    return {
      ...base,
      finished: true,
      score: session.score,
      total: asked.length,
      timeTaken: session.time_taken,
      review: asked.map((q, i) => ({
        question: q.question,
        category: q.category,
        correctAnswer: q.correctAnswer,
        answer: session.answers[i].answer,
        correct: session.answers[i].correct,
      })),
    };
  }

  const index = session.answers.length;
  const q = session.questions[index];
  return {
    ...base,
    finished: false,
    index,
    total: session.mode === "survival" ? null : session.questions.length,
    score: session.answers.filter((a) => a.correct).length,
    timeRemaining: getTimeRemaining(session),
    question: {
      question: q.question,
      category: q.category,
      options: shuffle([q.correctAnswer, ...q.incorrectAnswers]),
    },
  };
};

/** Load a session, making sure it belongs to whoever is asking. */
const findOwnSession = async (req, res) => {
  const session = await QuizSession.findByPk(req.params.id);
  if (!session || session.user_id !== (req.user?.id ?? null)) {
    res.status(404).json({ error: "Quiz not found" });
    return null;
  }
  return session;
};

const mostCommon = (values) => {
  const counts = {};
  values.forEach((v) => (counts[v] = (counts[v] || 0) + 1));
  return Object.keys(counts).reduce((a, b) => (counts[a] >= counts[b] ? a : b));
};

/** Record the result the same way the old /scores/logscore endpoint did. */
const saveScore = async (session) => {
  const asked = session.questions.slice(0, session.answers.length);
  const { mode, settings } = session;

  await Score.create({
    user_id: session.user_id,
    quiz_score: session.score,
    time_taken: session.time_taken,
    quiz_mode: mode,
    // Blitz has always stored its time limit here; other modes store difficulty.
    quiz_difficulty:
      mode === "blitz" ? String(settings.timeLimit) : mostCommon(asked.map((q) => q.difficulty)),
    categories: asked.map((q) => q.category),
    is_niche: asked.map((q) => q.isNiche),
    // Every question in a category quiz shares the category's display name.
    category_name: mode === "category" ? asked[0].category : null,
  });

  if (mode === "daily") {
    await User.update({ lastQuizDate: new Date() }, { where: { id: session.user_id } });
  }
  await checkAchievements(session.user_id);
};

const finishSession = async (session, answers) => {
  const now = new Date();
  let timeTaken = Math.round((now - session.started_at) / 1000);
  if (session.mode === "blitz") {
    timeTaken = Math.min(timeTaken, session.settings.timeLimit);
  }

  await session.update({
    answers,
    finished_at: now,
    score: answers.filter((a) => a.correct).length,
    time_taken: timeTaken,
  });

  if (session.user_id && session.mode !== "zen") {
    await saveScore(session);
  }
};

// --- Route handlers --------------------------------------------------------

// POST /api/quiz-sessions  { mode, timeLimit?, category? }
export const startSession = async (req, res) => {
  const { mode, timeLimit, category } = req.body;
  const userId = req.user?.id ?? null;

  if (!SOLO_MODES.includes(mode)) {
    return res.status(400).json({ error: "Unknown quiz mode" });
  }
  if (mode === "blitz" && !BLITZ_TIME_LIMITS.includes(timeLimit)) {
    return res.status(400).json({ error: "Invalid Blitz time limit" });
  }
  if (mode === "category" && typeof category !== "string") {
    return res.status(400).json({ error: "A category is required" });
  }

  try {
    let questions;
    let dailyDate = null;

    if (mode === "daily") {
      dailyDate = toDateCT();
      // One daily quiz per player per day: hand back today's session if it
      // exists, so refreshing resumes it instead of starting over.
      if (userId) {
        const existing = await QuizSession.findOne({
          where: { user_id: userId, mode: "daily", daily_date: dailyDate },
        });
        if (existing) return res.json(toClientState(existing));
      }
      questions = await getDailyQuestions(dailyDate);
    } else if (mode === "survival") {
      questions = await fetchTriviaQuestions({ limit: SURVIVAL_BATCH_SIZE });
    } else if (mode === "category") {
      questions = await fetchTriviaQuestions({ category });
    } else {
      questions = await fetchTriviaQuestions();
    }

    const session = await QuizSession.create({
      user_id: userId,
      mode,
      settings: mode === "blitz" ? { timeLimit } : mode === "category" ? { category } : {},
      daily_date: dailyDate,
      questions,
    });

    res.status(201).json(toClientState(session));
  } catch (error) {
    console.error("Error starting quiz session:", error);
    res.status(500).json({ error: "Error starting quiz" });
  }
};

// GET /api/quiz-sessions/:id
export const getSession = async (req, res) => {
  try {
    const session = await findOwnSession(req, res);
    if (session) res.json(toClientState(session));
  } catch (error) {
    console.error("Error fetching quiz session:", error);
    res.status(500).json({ error: "Error fetching quiz" });
  }
};

// POST /api/quiz-sessions/:id/answer  { answer }  (answer: null = time ran out)
export const submitAnswer = async (req, res) => {
  try {
    const session = await findOwnSession(req, res);
    if (!session) return;
    if (session.finished_at) {
      return res.status(409).json({ error: "This quiz is already finished" });
    }

    const { answer = null } = req.body;
    const index = session.answers.length;
    const question = session.questions[index];
    const remaining = getTimeRemaining(session);
    const outOfTime = answer === null || (remaining !== null && remaining < -GRACE_MS);

    let answers;
    if (session.mode === "blitz" && outOfTime) {
      // Blitz clock ran out: every unanswered question counts as wrong.
      const unanswered = session.questions.slice(index).map(() => ({ answer: null, correct: false }));
      answers = [...session.answers, ...unanswered];
    } else {
      const correct = !outOfTime && answer === question.correctAnswer;
      answers = [...session.answers, { answer: outOfTime ? null : answer, correct }];
    }

    const lastAnswer = answers[answers.length - 1];
    const finished =
      session.mode === "survival" ? !lastAnswer.correct : answers.length >= session.questions.length;

    if (finished) {
      await finishSession(session, answers);
    } else {
      let { questions } = session;
      // Survival never runs out: top up before the questions do.
      if (session.mode === "survival" && questions.length - answers.length < 5) {
        questions = [
          ...questions,
          ...(await fetchTriviaQuestions({ limit: SURVIVAL_BATCH_SIZE })),
        ];
      }
      await session.update({ answers, questions, question_started_at: new Date() });
    }

    res.json(toClientState(session));
  } catch (error) {
    console.error("Error submitting answer:", error);
    res.status(500).json({ error: "Error submitting answer" });
  }
};