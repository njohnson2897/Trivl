export default function Help() {
  return (
    <div className="content-container">
      <div className="help-container">
        <h1>Help/Support</h1>

        <section className="faq-section">
          <h2>Frequently Asked Questions (FAQ)</h2>
          <ul className="faq-list">
            <li>
              <h3>How do I reset my password?</h3>
              <p>Go to the Settings page, click "Change Password," and follow the instructions.</p>
            </li>
            <li>
              <h3>How do I report a bug or issue?</h3>
              <p>Use the contact form below or email us at <a href="mailto:support@gameapp.com">support@gameapp.com</a>.</p>
            </li>
            <li>
              <h3>What should I do if the game crashes?</h3>
              <p>Refresh the page or clear your browser cache. If the issue persists, contact support.</p>
            </li>
            <li>
              <h3>Where can I see my scores and achievements?</h3>
              <p>Your scores and achievements are visible on the Profile and Achievements pages.</p>
            </li>
            <li>
              <h3>How can I contact support?</h3>
              <p>Scroll down to the Contact Support section for details.</p>
            </li>
          </ul>
        </section>

        <section className="contact-section">
          <h2>Contact Support</h2>
          <p>
            If you have any questions or issues, feel free to reach out to us:
          </p>
          <ul className="contact-options">
            <li>
              <strong>Email:</strong> <a href="mailto:support@gameapp.com">support@gameapp.com</a>
            </li>
          </ul>
          <p>
            Or, fill out the form below to submit your query directly.
          </p>
          <form className="contact-form">
          <strong>Contact Form:</strong>
            <label>
              <strong>Name:</strong>
              <input type="text" placeholder="Your Name" />
            </label>
            <label>
              <strong>Email:</strong>
              <input type="email" placeholder="Your Email" />
            </label>
            <label>
              <strong>Message:</strong>
              <textarea placeholder="Describe your issue or question"></textarea>
            </label>
            <button type="submit">Submit</button>
          </form>
        </section>

        <section className="game-guide">
          <h2>Game Guide</h2>
          <p>
            Need help understanding how the game works? Here's a quick guide:
          </p>
          <ul>
            <li>
              <strong>Starting a Quiz:</strong> Select a topic and difficulty level, then click "Start Quiz."
            </li>
            <li>
              <strong>Scoring System:</strong> Earn points for each correct answer. Bonuses are awarded for streaks.
            </li>
            <li>
              <strong>Achievements:</strong> Unlock achievements by completing challenges or reaching milestones.
            </li>
            <li>
              <strong>Profile Management:</strong> View and edit your profile details on the Profile page.
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}