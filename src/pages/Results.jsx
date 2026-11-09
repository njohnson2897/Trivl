import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axiosInstance from "../../axiosConfig.js";
import { formatTime } from "../utils/helpers";
import { getCategoryLabel } from "../utils/categories.js";

const MODE_LABELS = {
  daily: "📅 Daily Quiz",
  blitz: "⚡ Blitz Mode",
  survival: "🏃 Survival Mode",
  challenge: "🎯 Challenge Quiz",
  zen: "🧘 Practice Quiz",
};

/** Both players' scores, and the winner once the second player finishes. */
function ChallengeScoreboard({ challengeId }) {
  const [challenge, setChallenge] = useState(null);

  // Poll until the opponent has played.
  useEffect(() => {
    let timer;
    const load = async () => {
      try {
        const { data } = await axiosInstance.get(`/api/challenges/${challengeId}`);
        setChallenge(data.challenge);
        if (data.challenge.status !== "completed") timer = setTimeout(load, 5000);
      } catch (error) {
        console.error("Error fetching challenge:", error);
      }
    };
    load();
    return () => clearTimeout(timer);
  }, [challengeId]);

  if (!challenge) return null;

  const players = [
    {
      name: challenge.challenger?.username,
      score: challenge.challengerScore,
      time: challenge.challengerTimeTaken,
    },
    {
      name: challenge.challenged?.username,
      score: challenge.challengedScore,
      time: challenge.challengedTimeTaken,
    },
  ];

  return (
    <>
      {challenge.status === "completed" && (
        <div className="challenge-winner">
          <h3>
            {challenge.winner ? `🎉 Winner: ${challenge.winner.username}` : "🤝 It's a draw!"}
          </h3>
        </div>
      )}
      <div className="challenge-results-grid">
        {players.map((player) => (
          <div key={player.name} className="challenge-column">
            <h3>{player.name}</h3>
            {player.score === null ? (
              <p>Waiting for this player to finish...</p>
            ) : (
              <>
                <p>Score: {player.score}/10</p>
                <p>Time: {formatTime(player.time)}</p>
              </>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

export default function Results() {
  const { sessionId } = useParams();
  const [result, setResult] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    axiosInstance
      .get(`/api/quiz-sessions/${sessionId}`)
      .then(({ data }) => (data.finished ? setResult(data) : setNotFound(true)))
      .catch(() => setNotFound(true));
  }, [sessionId]);

  if (notFound) {
    return (
      <div className="content-container">
        <div className="quiz-content">
          <h1>No Quiz Results</h1>
          <p>These results aren&apos;t available.</p>
          <div className="mt-4">
            <Link to="/" className="btn btn-primary">
              Take a Quiz
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const { mode, settings, score, total, timeTaken, review } = result;

  return (
    <div className="content-container">
      <div className="quiz-content">
        <h1>{mode === "challenge" ? "Challenge Results" : "Your Results"}</h1>
        <div className="results-summary">
          <p className="quiz-mode-indicator">
            {mode === "category"
              ? `🎯 ${getCategoryLabel(settings.category)} Quiz`
              : MODE_LABELS[mode]}
          </p>
          <p>{mode === "survival" ? `Score: ${score}` : `Score: ${score}/${total}`}</p>
          {timeTaken > 0 && <p>{`Time: ${formatTime(timeTaken)}`}</p>}
        </div>

        {mode === "challenge" && <ChallengeScoreboard challengeId={settings.challengeId} />}

        <div className="questions-container">
          {review.map((item, index) => (
            <div key={index} className="question-block">
              <p>{`Question ${index + 1}: ${item.question}`}</p>
              <div className="options">
                {item.options.map((option) => (
                  <p
                    key={option}
                    className={`option ${option === item.correctAnswer ? "correct" : ""} ${
                      option === item.answer && !item.correct ? "user-incorrect" : ""
                    }`}
                  >
                    {option}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
