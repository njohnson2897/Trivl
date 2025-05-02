export default function Help() {
  return (
    <div className="content-container">
      <div className="quiz-content">
        <h1>Help & Support</h1>

        <div className="instructions-section">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-item">
            <h3>How do I reset my password?</h3>
            <p>
              Go to the Settings page, click "Change Password," and follow the
              instructions.
            </p>
          </div>

          <div className="faq-item">
            <h3>How do I report a bug or contact support?</h3>
            <p>
              Please use the contact form below with details about the issue you
              encountered.
            </p>
          </div>

          <div className="faq-item">
            <h3>Where can I see my scores and achievements?</h3>
            <p>
              Your past scores are visible on the Quiz History page.
              Achievements are coming soon!
            </p>
          </div>

          <div className="faq-item">
            <h3>Why can't I take the quiz again today?</h3>
            <p>
              Trivl is a daily challenge! You can only take one quiz per day.
              Come back tomorrow!
            </p>
          </div>
        </div>

        <div className="instructions-section">
          <h2>Contact Our Team</h2>
          <div className="contact-methods">
            <div className="contact-card">
              <h3>Email Support</h3>
              <p>
                <a href="mailto:trivlsupport@gmail.com">
                  trivlsupport@gmail.com
                </a>
              </p>
              <p>
                We will do our best to respond to all support messages within 24
                hours
              </p>
              <p>
                Feel free to reach out directly over email or use the form to
                the right to submit a request
              </p>
            </div>

            <div className="contact-card">
              <h3>Submit a Request</h3>
              <form className="contact-form">
                <div className="form-group">
                  <label>Your Email</label>
                  <input type="email" placeholder="you@example.com" required />
                </div>
                <div className="form-group">
                  <label>Message</label>
                  <textarea
                    placeholder="Describe your issue..."
                    rows="4"
                    required
                  ></textarea>
                </div>
                <button type="submit" className="submit-btn">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
