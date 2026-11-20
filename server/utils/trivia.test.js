import { describe, it, expect, vi, afterEach } from "vitest";
import { fetchTriviaQuestions } from "./trivia.js";

// Replace the global fetch with a fake that returns `body` with `status`.
const fakeFetch = (body, status = 200) =>
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({ ok: status < 400, status, json: async () => body }))
  );

afterEach(() => vi.unstubAllGlobals());

describe("fetchTriviaQuestions", () => {
  it("asks for 10 questions by default", async () => {
    fakeFetch([{ question: "Q?" }]);
    await fetchTriviaQuestions();
    expect(fetch).toHaveBeenCalledWith("https://the-trivia-api.com/api/questions?limit=10");
  });

  it("adds the category when one is given", async () => {
    fakeFetch([{ question: "Q?" }]);
    await fetchTriviaQuestions({ limit: 50, category: "film_and_tv" });
    expect(fetch).toHaveBeenCalledWith(
      "https://the-trivia-api.com/api/questions?limit=50&categories=film_and_tv"
    );
  });

  it("returns the questions", async () => {
    fakeFetch([{ question: "A?" }, { question: "B?" }]);
    expect(await fetchTriviaQuestions()).toHaveLength(2);
  });

  it("also accepts the { value: [...] } shape", async () => {
    fakeFetch({ value: [{ question: "A?" }] });
    expect(await fetchTriviaQuestions()).toEqual([{ question: "A?" }]);
  });

  it("throws when the API fails", async () => {
    fakeFetch({}, 503);
    await expect(fetchTriviaQuestions()).rejects.toThrow("503");
  });

  it("throws when the API returns no questions", async () => {
    fakeFetch([]);
    await expect(fetchTriviaQuestions()).rejects.toThrow("no questions");
  });
});