import facebook from "../assets/fb.png";
import twitter from "../assets/twitter.png";
import instagram from "../assets/instagram.png";
import github from "../assets/gh.png";
import { useState } from "react";

export default function Footer() {
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
    <footer>
      <div className="footer-container">
        <div>
          <div className="row">
            <div className="col-md-4 col-lg-3">
              <div>
                <div className="mb-2">
                  <span>Want to Spread the Word? Share On Social Media!</span>
                </div>
                <div>
                  <a href="https://www.facebook.com/" target="blank">
                    <img
                      src={facebook}
                      alt="facebook logo"
                      height="40px"
                      className="mx-1"
                    />
                  </a>
                  <a href="https://twitter.com/" target="blank">
                    <img
                      src={twitter}
                      alt="twitter logo"
                      height="40px"
                      className="mx-1"
                    />
                  </a>
                  <a href="https://www.instagram.com/" target="blank">
                    <img
                      src={instagram}
                      alt="instagram logo"
                      height="40px"
                      className="mx-1"
                    />
                  </a>
                </div>
              </div>
            </div>

            <div className="col-md-4 col-lg-3 offset-lg-2">
              <h5>
                <div>
                  <a
                    className="text-dark"
                    href="https://github.com/njohnson2897/Trivl"
                    target="blank"
                  >
                    <img src={github} alt="github logo" />
                    Github
                  </a>
                </div>
              </h5>
              <h6>
                Designed by: Nate Johnson, Ben Mallar, Robin Langton, and Bryan
                LeBeuf
              </h6>
            </div>

            <div className="col-md-4 col-lg-3 offset-lg-1">
              <div>
                <h5>Contact Us</h5>
                <div className="form" id="bottom">
                  <form onSubmit={handleSubmit}>
                    <div className="form-group">
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="form-control form-control-sm"
                        placeholder="Email"
                        required
                      />
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        className="form-control form-control-sm"
                        placeholder="Message"
                        required
                        rows="3"
                      />
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
                        className="btn btn-dark btn-block btn-sm my-2"
                        disabled={status.type === "loading"}
                      >
                        {status.type === "loading"
                          ? "Sending..."
                          : "Send Message"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
