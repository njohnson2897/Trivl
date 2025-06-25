import facebook from "../assets/fb.png";
import twitter from "../assets/twitter.png";
import instagram from "../assets/instagram.png";
import github from "../assets/gh.png";
import { useNavigate } from "react-router-dom";

export default function Footer() {
  const navigate = useNavigate();

  const handleContactClick = () => {
    navigate("/help");
    // Scroll to contact section after navigation
    setTimeout(() => {
      const contactSection = document.getElementById("contact");
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  return (
    <footer>
      <div className="footer-container">
        <div>
          <div className="row">
            <div className="col-md-4">
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

            <div className="col-md-4">
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

            <div className="col-md-4">
              <div>
                <p className="footer-text mb-3">
                  Have questions or feedback? We'd love to hear from you!
                </p>
                <button
                  onClick={handleContactClick}
                  className="btn btn-outline-primary"
                >
                  Contact Us
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
