import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar, Nav, Button, Offcanvas } from "react-bootstrap";
import AuthModal from "./AuthModal.jsx";

function Header() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const navigate = useNavigate();

  const handleShowAuthModal = () => setShowAuthModal(true);
  const handleCloseAuthModal = () => setShowAuthModal(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    // Clear all quiz-related data from localStorage
    for (let i = 0; i < 10; i++) {
      localStorage.removeItem(`question${i}`);
      localStorage.removeItem(`userAnswer${i}`);
    }
    localStorage.removeItem("lastUpdateTime");
    localStorage.removeItem("quizStatus");
    localStorage.removeItem("triviaQuestions");
    localStorage.removeItem("currentQuestionIndex");
    localStorage.removeItem("quizStartTime");
    localStorage.removeItem("quizTimeTaken");

    setIsLoggedIn(false);
    setShowOffcanvas(false);
    setShowMobileMenu(false);

    // Dispatch custom event to notify other components of logout
    window.dispatchEvent(new CustomEvent("userLogout"));

    navigate("/");
  };

  const toggleOffcanvas = () => setShowOffcanvas(!showOffcanvas);
  const toggleMobileMenu = () => setShowMobileMenu(!showMobileMenu);

  const handleMobileNavClick = (action) => {
    setShowMobileMenu(false);
    if (action === "logout") {
      handleLogout();
    } else if (action === "auth") {
      handleShowAuthModal();
    }
  };

  return (
    <>
      <header className="header">
        <Link to="/" className="header-title">
          TRIVL
        </Link>
        {/* Desktop/Tablet Navigation - Offcanvas */}
        <div className="desktop-nav">
          <Navbar expand={false}>
            <Navbar.Toggle
              aria-controls="offcanvasNavbar"
              onClick={toggleOffcanvas}
            />
            <Navbar.Offcanvas
              id="offcanvasNavbar"
              aria-labelledby="offcanvasNavbarLabel"
              placement="end"
              show={showOffcanvas}
              onHide={toggleOffcanvas}
            >
              <Offcanvas.Header closeButton>
                <Offcanvas.Title id="offcanvasNavbarLabel">
                  Menu
                </Offcanvas.Title>
              </Offcanvas.Header>
              <Offcanvas.Body>
                <Nav className="flex-column">
                  <Link
                    to="/leaderboard"
                    className="nav-link mb-2"
                    onClick={() => setShowOffcanvas(false)}
                  >
                    Leaderboard
                  </Link>
                  <Link
                    to="/settings"
                    className="nav-link mb-2"
                    onClick={() => setShowOffcanvas(false)}
                  >
                    Settings
                  </Link>
                  <Link
                    to="/help"
                    className="nav-link mb-2"
                    onClick={() => setShowOffcanvas(false)}
                  >
                    Help/Support
                  </Link>
                  <Link
                    to="/instructions"
                    className="nav-link mb-2"
                    onClick={() => setShowOffcanvas(false)}
                  >
                    How to Play
                  </Link>
                  {isLoggedIn ? (
                    <>
                      <Link
                        to="/profile"
                        className="nav-link mb-2"
                        onClick={() => setShowOffcanvas(false)}
                      >
                        Profile
                      </Link>
                      <Link
                        to="/friends"
                        className="nav-link mb-2"
                        onClick={() => setShowOffcanvas(false)}
                      >
                        Friend List
                      </Link>
                      <Link
                        to="/quiz-history"
                        className="nav-link mb-2"
                        onClick={() => setShowOffcanvas(false)}
                      >
                        Quiz History
                      </Link>
                      <Link
                        to="/achievements"
                        className="nav-link mb-2"
                        onClick={() => setShowOffcanvas(false)}
                      >
                        Achievements
                      </Link>
                      <Link
                        to="/user-list"
                        className="nav-link mb-2"
                        onClick={() => setShowOffcanvas(false)}
                      >
                        User List
                      </Link>
                      <Link
                        to="/notifications"
                        className="nav-link mb-2"
                        onClick={() => setShowOffcanvas(false)}
                      >
                        Notifications
                      </Link>
                      <Button
                        variant="outline-primary"
                        onClick={handleLogout}
                        className="mb-3"
                      >
                        Log Out
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline-primary"
                      onClick={() => {
                        setShowOffcanvas(false);
                        handleShowAuthModal();
                      }}
                      className="mb-3"
                    >
                      Log In or Sign Up
                    </Button>
                  )}
                </Nav>
              </Offcanvas.Body>
            </Navbar.Offcanvas>
          </Navbar>
        </div>
        {/* Mobile Navigation - Collapsible Menu */}
        <div className="mobile-nav">
          <button
            className={`hamburger-button ${showMobileMenu ? "active" : ""}`}
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
            aria-expanded={showMobileMenu}
            aria-controls="mobile-menu-content"
          >
            <span className="hamburger-icon">
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
        </div>
      </header>
      {/* Mobile Menu - block element, not overlay */}
      {showMobileMenu && (
        <nav
          id="mobile-menu-content"
          className="mobile-menu-content"
          aria-label="Mobile menu"
        >
          <Link
            to="/leaderboard"
            className="mobile-menu-item"
            onClick={() => setShowMobileMenu(false)}
          >
            Leaderboard
          </Link>
          <Link
            to="/settings"
            className="mobile-menu-item"
            onClick={() => setShowMobileMenu(false)}
          >
            Settings
          </Link>
          <Link
            to="/help"
            className="mobile-menu-item"
            onClick={() => setShowMobileMenu(false)}
          >
            Help/Support
          </Link>
          <Link
            to="/instructions"
            className="mobile-menu-item"
            onClick={() => setShowMobileMenu(false)}
          >
            How to Play
          </Link>
          {isLoggedIn ? (
            <>
              <div className="mobile-menu-divider"></div>
              <Link
                to="/profile"
                className="mobile-menu-item"
                onClick={() => setShowMobileMenu(false)}
              >
                Profile
              </Link>
              <Link
                to="/friends"
                className="mobile-menu-item"
                onClick={() => setShowMobileMenu(false)}
              >
                Friend List
              </Link>
              <Link
                to="/quiz-history"
                className="mobile-menu-item"
                onClick={() => setShowMobileMenu(false)}
              >
                Quiz History
              </Link>
              <Link
                to="/achievements"
                className="mobile-menu-item"
                onClick={() => setShowMobileMenu(false)}
              >
                Achievements
              </Link>
              <Link
                to="/user-list"
                className="mobile-menu-item"
                onClick={() => setShowMobileMenu(false)}
              >
                User List
              </Link>
              <Link
                to="/notifications"
                className="mobile-menu-item"
                onClick={() => setShowMobileMenu(false)}
              >
                Notifications
              </Link>
              <div className="mobile-menu-divider"></div>
              <button
                className="mobile-menu-item mobile-menu-button"
                onClick={() => handleMobileNavClick("logout")}
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <div className="mobile-menu-divider"></div>
              <button
                className="mobile-menu-item mobile-menu-button"
                onClick={() => handleMobileNavClick("auth")}
              >
                Log In or Sign Up
              </button>
            </>
          )}
        </nav>
      )}
      <AuthModal
        show={showAuthModal}
        handleClose={handleCloseAuthModal}
        setIsLoggedIn={setIsLoggedIn}
      />
    </>
  );
}

export default Header;
