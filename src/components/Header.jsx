import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Navbar, Nav, Button, Offcanvas, Dropdown } from "react-bootstrap";
import { jwtDecode } from "jwt-decode";
import AuthModal from "./AuthModal.jsx";
import axiosInstance from "../../axiosConfig.js";

function Header() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [username, setUsername] = useState("");
  const [pendingNotifications, setPendingNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Function to fetch notifications
  const fetchNotifications = async () => {
    const token = localStorage.getItem("token");
    console.log("🔍 fetchNotifications called", { token: !!token, isLoggedIn });
    if (token && isLoggedIn) {
      try {
        const response = await axiosInstance.get("/api/friends/requests");
        console.log("🔍 API response status:", response.status);
        console.log("🔍 API response data:", response.data);
        setPendingNotifications(response.data.friendRequests || []);
        console.log(
          "🔍 Set pending notifications:",
          response.data.friendRequests || []
        );
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    }
  };

  // Get username from token and fetch notifications
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && isLoggedIn) {
      try {
        const decodedToken = jwtDecode(token);
        setUsername(decodedToken.username || "");
        fetchNotifications();
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    } else {
      setUsername("");
      setPendingNotifications([]);
    }
  }, [isLoggedIn]);

  // Refresh notifications when the user navigates (e.g., after sending a friend request)
  useEffect(() => {
    if (isLoggedIn) {
      fetchNotifications();
    }
  }, [location.pathname, isLoggedIn]); // This will run when the route changes or when isLoggedIn changes

  // Periodic refresh of notifications (every 30 seconds)
  useEffect(() => {
    if (!isLoggedIn) return;

    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [isLoggedIn]);

  // Refresh notifications when the window regains focus
  useEffect(() => {
    if (!isLoggedIn) return;

    const handleFocus = () => {
      fetchNotifications();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [isLoggedIn]);

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
    setUsername("");
    setPendingNotifications([]);
    setShowOffcanvas(false);
    setShowMobileMenu(false);
    setShowNotifications(false);
    setShowMessages(false);

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
          <div className="nav-buttons">
            {isLoggedIn && (
              <>
                {/* Notifications Button */}
                <Dropdown
                  show={showNotifications}
                  onToggle={(isOpen) => {
                    setShowNotifications(isOpen);
                    // Refresh notifications when dropdown is opened
                    if (isOpen) {
                      fetchNotifications();
                    }
                  }}
                >
                  <Dropdown.Toggle
                    as={Button}
                    variant="outline-secondary"
                    size="sm"
                    className="nav-icon-button"
                  >
                    <span className="notification-icon">🔔</span>
                    {pendingNotifications.length > 0 && (
                      <span className="notification-badge">
                        {pendingNotifications.length}
                      </span>
                    )}
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="notification-dropdown">
                    <Dropdown.Header className="d-flex justify-content-between align-items-center">
                      <span>Notifications</span>
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          fetchNotifications();
                        }}
                        style={{ fontSize: "12px", padding: "2px 6px" }}
                      >
                        🔄
                      </button>
                    </Dropdown.Header>
                    {pendingNotifications.length > 0 ? (
                      pendingNotifications.map((request) => (
                        <Dropdown.Item
                          key={request.id}
                          className="notification-item"
                        >
                          <div className="notification-content">
                            <div className="d-flex justify-content-between align-items-start">
                              <div>
                                <strong>{request.user.username}</strong> sent
                                you a friend request
                              </div>
                              <div className="notification-actions ms-2">
                                <button
                                  className="btn btn-sm btn-success me-1"
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    try {
                                      await axiosInstance.post(
                                        `/api/friends/accept/${request.id}`
                                      );
                                      // Remove the accepted request from the list
                                      setPendingNotifications((prev) =>
                                        prev.filter(
                                          (req) => req.id !== request.id
                                        )
                                      );
                                    } catch (error) {
                                      console.error(
                                        "Error accepting friend request:",
                                        error
                                      );
                                    }
                                  }}
                                  style={{
                                    fontSize: "10px",
                                    padding: "1px 4px",
                                  }}
                                >
                                  ✓
                                </button>
                                <button
                                  className="btn btn-sm btn-danger"
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    try {
                                      await axiosInstance.post(
                                        `/api/friends/reject/${request.id}`
                                      );
                                      // Remove the rejected request from the list
                                      setPendingNotifications((prev) =>
                                        prev.filter(
                                          (req) => req.id !== request.id
                                        )
                                      );
                                    } catch (error) {
                                      console.error(
                                        "Error rejecting friend request:",
                                        error
                                      );
                                    }
                                  }}
                                  style={{
                                    fontSize: "10px",
                                    padding: "1px 4px",
                                  }}
                                >
                                  ✗
                                </button>
                              </div>
                            </div>
                          </div>
                        </Dropdown.Item>
                      ))
                    ) : (
                      <Dropdown.Item disabled className="notification-empty">
                        No new notifications
                      </Dropdown.Item>
                    )}
                    <Dropdown.Divider />
                    <Dropdown.Item
                      as={Link}
                      to="/notifications"
                      onClick={() => setShowNotifications(false)}
                    >
                      View All Notifications
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>

                {/* Messages Button */}
                <Dropdown show={showMessages} onToggle={setShowMessages}>
                  <Dropdown.Toggle
                    as={Button}
                    variant="outline-secondary"
                    size="sm"
                    className="nav-icon-button"
                  >
                    <span className="message-icon">💬</span>
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="message-dropdown">
                    <Dropdown.Header>Messages</Dropdown.Header>
                    <Dropdown.Item disabled className="message-empty">
                      Messaging system coming soon!
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item disabled>
                      Start conversations with friends
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </>
            )}

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
                    {isLoggedIn && username ? `Welcome, ${username}` : "Menu"}
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
