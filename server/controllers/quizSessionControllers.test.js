import { describe, it, expect, vi, beforeEach } from "vitest";

// In-memory stand-ins for the database models and the Trivia API, so these
// tests exercise the real quiz logic without a database or network.
const fakes = vi.hoisted(() => {
  const db = {};
  let questionNumber = 0;
  const matches = (row, where) => Object.entries(where).every(([k, v]) => row[k] === v);
  const makeQuestions = (count, category) =>
    Array.from({ length: count }, () => {
      questionNumber += 1;
      return {
        question: `Question ${questionNumber}?`,
        correctAnswer: `Right ${questionNumber}`,
        incorrectAnswers: ["Wrong 1", "Wrong 2", "Wrong 3"],
        category: category ? "Film & TV" : "Science",
        difficulty: "easy",
        isNiche: false,
      };
    });
  const withUpdate = (row) => {
    row.update = async (changes) => Object.assign(row, changes);
    return row;
  };

  return {
    db,
    reset() {
      Object.assign(db, { sessions: new Map(), daily: new Map(), challenges: new Map(), scores: [], userUpdates: [], fetches: [], achievementChecks: 0 });
    },
    makeQuestions,
    fetchTriviaQuestions: async ({ limit = 10, category } = {}) => {
      db.fetches.push({ limit, category });
      return makeQuestions(limit, category);
    },
    checkAchievements: async () => {
      db.achievementChecks += 1;
    },
    QuizSession: {
      async create(fields) {
        const session = withUpdate({
          id: crypto.randomUUID(), settings: {}, answers: [], daily_date: null,
          started_at: new Date(), question_started_at: new Date(),
          finished_at: null, score: null, time_taken: null, ...fields,
        });
        db.sessions.set(session.id, session);
        return session;
      },
      findByPk: async (id) => db.sessions.get(id) ?? null,
      findOne: async ({ where }) => [...db.sessions.values()].find((s) => matches(s, where)) ?? null,
      findAll: async ({ where }) => [...db.sessions.values()].filter((s) => matches(s, where)),
    },
    DailyQuestions: {
      findOne: async ({ where }) => (db.daily.has(where.date) ? { questions: db.daily.get(where.date) } : null),
      create: async ({ date, questions }) => db.daily.set(date, questions),
    },
    Score: {
      create: async (fields) => db.scores.push({ ...fields }),
      update: async (changes, { where }) => db.scores.filter((s) => matches(s, where)).forEach((s) => Object.assign(s, changes)),
    },
    User: {
      update: async (changes, options) => db.userUpdates.push({ changes, options }),
      findByPk: async (id) => ({ username: `user${id}` }),
    },
    Challenge: {
      findByPk: async (id) => db.challenges.get(Number(id)) ?? null,
    },
    addChallenge(fields) {
      const challenge = withUpdate({
        status: "pending", challengerScore: null, challengedScore: null,
        challengerTimeTaken: null, challengedTimeTaken: null, winnerId: null, ...fields,
      });
      db.challenges.set(challenge.id, challenge);
      return challenge;
    },
  };
});

vi.mock("../models/index.js", () => ({
  QuizSession: fakes.QuizSession,
  DailyQuestions: fakes.DailyQuestions,
  Score: fakes.Score,
  User: fakes.User,
  Challenge: fakes.Challenge,
}));
vi.mock("../utils/trivia.js", () => ({ fetchTriviaQuestions: fakes.fetchTriviaQuestions }));
vi.mock("./achievementControllers.js", () => ({ checkAchievements: fakes.checkAchievements }));

import { startSession, getSession, submitAnswer } from "./quizSessionControllers.js";

const { db } = fakes;
const ALICE = { id: 1 };
const BOB = { id: 2 };

/** Call a route handler the way Express would; returns the status and JSON body. */
const call = async (handler, { body = {}, params = {}, user } = {}) => {
  const result = { status: 200, json: undefined };
  const res = {
    status(code) { result.status = code; return this; },
    json(data) { result.json = data; return this; },
  };
  await handler({ body, params, user }, res);
  return result;
};

const start = (body, user) => call(startSession, { body, user });
const answer = (id, value, user) => call(submitAnswer, { params: { id }, body: { answer: value }, user });
const rightAnswer = (id) => {
  const session = db.sessions.get(id);
  return session.questions[session.answers.length].correctAnswer;
};
/** Answer `count` questions, getting the first `correct` of them right. */
const play = async (id, user, { correct, count = 10 }) => {
  let response;
  for (let i = 0; i < count; i++) {
    response = await answer(id, i < correct ? rightAnswer(id) : "a wrong answer", user);
  }
  return response;
};
/** Pretend the session started (or its current question was shown) `seconds` ago. */
const rewind = (id, field, seconds) => {
  db.sessions.get(id)[field] = new Date(Date.now() - seconds * 1000);
};

beforeEach(() => fakes.reset());

describe("starting a quiz", () => {
  it("rejects unknown modes and bad settings", async () => {
    expect((await start({ mode: "nope" })).status).toBe(400);
    expect((await start({ mode: "blitz", timeLimit: 90 })).status).toBe(400);
    expect((await start({ mode: "category" })).status).toBe(400);
  });

  it("sends the first question without its answer", async () => {
    const { status, json } = await start({ mode: "zen" });
    expect(status).toBe(201);
    expect(json.question.options).toHaveLength(4);
    expect(json.question.options).toContain(rightAnswer(json.id)); // the right option is offered...
    expect(json.question).not.toHaveProperty("correctAnswer"); // ...but not marked
  });

  it("gives everyone the same daily questions, fetched once a day", async () => {
    const first = await start({ mode: "daily" }, ALICE);
    const second = await start({ mode: "daily" }, BOB);
    expect(second.json.question.question).toBe(first.json.question.question);
    expect(db.fetches).toHaveLength(1);
  });

  it("resumes today's daily quiz instead of starting a new one", async () => {
    const first = await start({ mode: "daily" }, ALICE);
    const again = await start({ mode: "daily" }, ALICE);
    expect(again.json.id).toBe(first.json.id);
  });
});

describe("answering", () => {
  it("grades every answer and saves the score at the end", async () => {
    const { json } = await start({ mode: "daily" }, ALICE);
    const end = await play(json.id, ALICE, { correct: 7 });

    expect(end.json).toMatchObject({ finished: true, score: 7, total: 10 });
    expect(end.json.review).toHaveLength(10);
    expect(db.scores[0]).toMatchObject({ user_id: 1, quiz_mode: "daily", quiz_score: 7 });
    expect(db.userUpdates).toHaveLength(1); // daily cooldown recorded
    expect(db.achievementChecks).toBe(1);
  });

  it("refuses answers once the quiz is over", async () => {
    const { json } = await start({ mode: "zen" }, ALICE);
    await play(json.id, ALICE, { correct: 0 });
    expect((await answer(json.id, "late", ALICE)).status).toBe(409);
  });

  it("hides one player's quiz from everyone else", async () => {
    const { json } = await start({ mode: "zen" }, ALICE);
    expect((await call(getSession, { params: { id: json.id }, user: BOB })).status).toBe(404);
    expect((await call(getSession, { params: { id: json.id } })).status).toBe(404);
    expect((await answer(json.id, "x", BOB)).status).toBe(404);
  });

  it("never saves Zen scores", async () => {
    const { json } = await start({ mode: "zen" }, ALICE);
    await play(json.id, ALICE, { correct: 10 });
    expect(db.scores).toHaveLength(0);
  });

  it("saves a category quiz under the category's display name", async () => {
    const { json } = await start({ mode: "category", category: "film_and_tv" }, ALICE);
    await play(json.id, ALICE, { correct: 5 });
    expect(db.scores[0].category_name).toBe("Film & TV");
  });
});

describe("Blitz", () => {
  it("ends when the clock runs out and counts unanswered questions as wrong", async () => {
    const { json } = await start({ mode: "blitz", timeLimit: 30 }, ALICE);
    await answer(json.id, rightAnswer(json.id), ALICE);
    rewind(json.id, "started_at", 40);

    const end = await answer(json.id, rightAnswer(json.id), ALICE); // too late
    expect(end.json).toMatchObject({ finished: true, score: 1, total: 10, timeTaken: 30 });
    expect(db.scores[0].quiz_difficulty).toBe("30"); // Blitz stores its time limit here
  });
});

describe("Survival", () => {
  it("keeps going past the first batch of questions", async () => {
    const { json } = await start({ mode: "survival" }, ALICE);
    const response = await play(json.id, ALICE, { correct: 60, count: 60 });
    expect(response.json.finished).toBe(false);
    expect(db.sessions.get(json.id).questions.length).toBeGreaterThan(60);
  });

  it("ends on a slow answer, even a correct one", async () => {
    const { json } = await start({ mode: "survival" }, ALICE);
    await play(json.id, ALICE, { correct: 3, count: 3 });
    rewind(json.id, "question_started_at", 18);

    const end = await answer(json.id, rightAnswer(json.id), ALICE);
    expect(end.json).toMatchObject({ finished: true, score: 3, total: 4 });
  });
});

describe("challenges", () => {
  // Alice (id 1) challenges Bob (id 2)
  const challenge = () =>
    fakes.addChallenge({ id: 5, challengerId: 1, challengedId: 2, questions: fakes.makeQuestions(10) });
  const startChallenge = (user) => start({ mode: "challenge", challengeId: 5 }, user);

  it("is only open to the two players, after the challenged player accepts", async () => {
    challenge();
    expect((await startChallenge(undefined)).status).toBe(401);
    expect((await startChallenge({ id: 3 })).status).toBe(404);
    expect((await startChallenge(BOB)).status).toBe(409); // not accepted yet
    expect((await startChallenge(ALICE)).status).toBe(201);
  });

  it("gives each player exactly one attempt", async () => {
    challenge();
    const first = await startChallenge(ALICE);
    expect((await startChallenge(ALICE)).json.id).toBe(first.json.id); // refresh resumes
    await play(first.json.id, ALICE, { correct: 6 });
    expect((await startChallenge(ALICE)).json.finished).toBe(true);
  });

  it("picks the winner once both have played, in either order", async () => {
    const c = challenge();
    c.status = "in_progress";
    const bob = await startChallenge(BOB); // the challenged player goes first
    await play(bob.json.id, BOB, { correct: 8 });
    expect(c.status).toBe("in_progress");

    const alice = await startChallenge(ALICE);
    await play(alice.json.id, ALICE, { correct: 6 });
    expect(c).toMatchObject({ status: "completed", winnerId: 2 });
    expect(db.scores.find((s) => s.user_id === 2).won_challenge).toBe(true);
    expect(db.scores.find((s) => s.user_id === 1).won_challenge).toBe(false);
  });

  it("breaks a tied score with the faster time", async () => {
    const c = challenge();
    c.status = "in_progress";
    const alice = await startChallenge(ALICE);
    await play(alice.json.id, ALICE, { correct: 5 });
    const bob = await startChallenge(BOB);
    rewind(bob.json.id, "started_at", 300);
    await play(bob.json.id, BOB, { correct: 5 });
    expect(c.winnerId).toBe(1);
  });
});