export default function QuizHistory() {

  const quizHistoryData = [
  {
    id: 1,
    quizName: "General Knowledge Trivia",
    date: "2024-11-01",
    score: "8/10",
    timeTaken: "4m 23s",
    difficulty: "Medium",
  },
  {
    id: 2,
    quizName: "Science and Technology",
    date: "2024-10-30",
    score: "6/10",
    timeTaken: "5m 12s",
    difficulty: "Hard",
  },
  {
    id: 3,
    quizName: "History Quiz",
    date: "2024-10-28",
    score: "9/10",
    timeTaken: "3m 50s",
    difficulty: "Medium",
  },
  {
    id: 4,
    quizName: "Math and Logic",
    date: "2024-10-26",
    score: "7/10",
    timeTaken: "6m 10s",
    difficulty: "Hard",
  },
  {
    id: 5,
    quizName: "Pop Culture Fun",
    date: "2024-10-20",
    score: "10/10",
    timeTaken: "2m 45s",
    difficulty: "Easy",
  },
  {
    id: 6,
    quizName: "Sports Trivia",
    date: "2024-10-15",
    score: "5/10",
    timeTaken: "7m 05s",
    difficulty: "Hard",
  },
  {
    id: 7,
    quizName: "World Geography",
    date: "2024-10-12",
    score: "6/10",
    timeTaken: "5m 30s",
    difficulty: "Medium",
  },
  {
    id: 8,
    quizName: "Literature and Books",
    date: "2024-10-10",
    score: "8/10",
    timeTaken: "4m 20s",
    difficulty: "Medium",
  },
  {
    id: 9,
    quizName: "Movie Trivia",
    date: "2024-10-05",
    score: "9/10",
    timeTaken: "3m 55s",
    difficulty: "Easy",
  },
  {
    id: 10,
    quizName: "Music Knowledge",
    date: "2024-10-01",
    score: "7/10",
    timeTaken: "4m 50s",
    difficulty: "Medium",
  },
];


    return (
      <div className='content-container'>
      <div className='quiz-content'>
    <h1 className='mb-4'>Your Quiz History</h1>
    <div className="quiz-history-grid">
  {quizHistoryData.map((quiz) => (
    <div key={quiz.id} className="quiz-history-card">
      <p><strong>Date:</strong> {quiz.date}</p>
      <p><strong>Score:</strong> {quiz.score}</p>
      <p><strong>Time Taken:</strong> {quiz.timeTaken}</p>
      <p><strong>Difficulty:</strong> {quiz.difficulty}</p>
    </div>
  ))}
</div>

    </div>
    </div>
    )
  }
  