export default function FriendsList() {
  const friends = [
    { id: 1, username: "QuizBuddy123", status: "Online", joined: "2023-11-15" },
    { id: 2, username: "BrainiacBestie", status: "Offline", joined: "2023-08-10" },
    { id: 3, username: "SmartySidekick", status: "Online", joined: "2024-01-05" },
    { id: 4, username: "TriviaTitan", status: "Offline", joined: "2023-09-20" },
    { id: 5, username: "KnowledgeKnack", status: "Online", joined: "2023-12-02" },
    { id: 6, username: "QuickQuizzler", status: "Offline", joined: "2023-07-18" },
    { id: 7, username: "PuzzlePartner", status: "Online", joined: "2023-10-25" },
    { id: 8, username: "AnswerAce", status: "Offline", joined: "2023-11-05" },
    { id: 9, username: "JuneJune", status: "Online", joined: "2024-01-09"},
    { id: 10, username: "SaucySam", status: "Online", joined: "2022-06-29"},
    { id: 11, username: "BrendaB", status: "Offline", joined: "2024-02-14"},
    { id: 12, username: "TailwindTom", status: "Online", joined: "2023-01-25"}
  ];

  return (
    <div className="content-container">
      <div className="quiz-content">
        <h2>Your Friends</h2>
        <div className="friends-grid">
          {friends.map((friend) => (
            <div key={friend.id} className="friend-card">
              <h3>{friend.username}</h3>
              <p>Status: <span className={friend.status.toLowerCase()}>{friend.status}</span></p>
              <p>Joined: {friend.joined}</p>
              <button className="message-btn">Send Message</button>
              <button className="challenge-btn">Challenge to Quiz</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
