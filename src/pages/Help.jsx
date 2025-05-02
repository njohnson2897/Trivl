import { useState } from "react";

export default function Help() {
  const [formData, setFormData] = useState({
    email: "",
    message: "",
  });
  const [status, setStatus] = useState({
    type: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "loading", message: "Sending message..." });

    try {
      const response = await fetch("http://localhost:5000/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send message");
      }

      setStatus({
        type: "success",
        message: "Message sent successfully!",
      });
      setFormData({ email: "", message: "" });
    } catch (error) {
      console.error("Error sending message:", error);
      setStatus({
        type: "error",
        message: error.message || "Failed to send message. Please try again.",
      });
    }
  };

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
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Your Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Describe your issue..."
                    rows="4"
                    required
                  ></textarea>
                </div>
                {status.message && (
                  <div
                    className={`alert ${
                      status.type === "success"
                        ? "alert-success"
                        : status.type === "error"
                        ? "alert-danger"
                        : "alert-info"
                    } mt-2`}
                  >
                    {status.message}
                  </div>
                )}
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={status.type === "loading"}
                >
                  {status.type === "loading" ? "Sending..." : "Send Message"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
