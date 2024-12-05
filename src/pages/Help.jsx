export default function Help() {
  return (
    <div className="content-container">
      <div className="quiz-content">
        <h2>Help/Support</h2>

        {/* FAQ Section */}
        <section className="help-section">
          <h3>Frequently Asked Questions (FAQ)</h3>
          <ul className="faq-list">
            <li>
              <strong>How do I reset my password?</strong>
              <p>Go to the Settings page, click "Change Password," and follow the instructions.</p>
            </li>
            <li>
              <strong>How do I report a bug or issue?</strong>
              <p>Use the contact form below or email us at <a href="mailto:support@gameapp.com">support@gameapp.com</a>.</p>
            </li>
            <li>
              <strong>What should I do if the game crashes?</strong>
              <p>Refresh the page or clear your browser cache. If the issue persists, contact support.</p>
            </li>
            <li>
              <strong>Where can I see my scores and achievements?</strong>
              <p>Your scores and achievements are visible on the Profile and Achievements pages.</p>
            </li>
            <li>
              <strong>How can I contact support?</strong>
              <p>Scroll down to the Contact Support section for details.</p>
            </li>
          </ul>
        </section>

        {/* Contact Support Section */}
        <section className="help-section">
          <h3>Contact Support</h3>
          <p>
            If you have any questions or issues, feel free to reach out to us:
          </p>
          <ul>
            <li>
              <strong>Email:</strong> <a href="mailto:support@gameapp.com">support@gameapp.com</a>
            </li>
            <li>
              <strong>Contact Form:</strong> Fill out the form below to submit your query directly.
            </li>
          </ul>
          <form className="contact-form">
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

        {/* Game Guide Section */}
        <section className="help-section">
          <h3>Game Guide</h3>
          <p>
            Need help understanding how the game works? Here’s a quick guide:
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
