const TRIVIA_API_URL = "https://the-trivia-api.com/api/questions";

/** Fetch questions from the Trivia API, optionally from a single category. */
export const fetchTriviaQuestions = async ({ limit = 10, category } = {}) => {
  const params = new URLSearchParams({ limit: String(limit) });
  if (category) params.set("categories", category);

  const response = await fetch(`${TRIVIA_API_URL}?${params}`);
  if (!response.ok) {
    throw new Error(`Trivia API responded with ${response.status}`);
  }

  const data = await response.json();
  // Usually an array, but the API has also returned { value: [...] }.
  const questions = Array.isArray(data) ? data : data.value;
  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error("Trivia API returned no questions");
  }
  return questions;
};