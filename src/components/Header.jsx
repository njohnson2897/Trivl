import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Navbar, Nav, Button, Offcanvas } from "react-bootstrap";
import { jwtDecode } from "jwt-decode";
import AuthModal from "./AuthModal.jsx";
import axiosInstance from "../../axiosConfig.js";

// [path, label] for each menu entry; the desktop and mobile menus both render from these.
const PUBLIC_LINKS = [
  ["/leaderboard", "Leaderboard"],
  ["/settings", "Settings"],
  ["/help", "Help/Support"],
  ["/instructions", "How to Play"],
];
const MEMBER_LINKS = [
  ["/profile", "Profile"],
  ["/friends", "Friend List"],
  ["/quiz-history", "Quiz History"],
  ["/achievements", "Achievements"],
  ["/user-list", "User List"],
  ["/notifications", "Notifications"],
];

const getUsername = () => {
  try {
    return jwtDecode(localStorage.getItem("token")).username || "";
  } catch {
    return "";
  }
};

function Header() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  // Count pending friend requests and challenges for the bell badge.
  // Refreshes on every page change and every 30 seconds.
  useEffect(() => {
    if (!isLoggedIn) {
      setNotificationCount(0);
      return;
    }
    const fetchCount = async () => {
      try {
        const [requests, challenges] = await Promise.all([
          axiosInstance.get("/api/friends/requests"),
          axiosInstance.get("/api/challenges/pending"),
        ]);
        setNotificationCount(
          (requests.data.friendRequests?.length || 0) +
            (challenges.data.challenges?.length || 0)
        );
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [isLoggedIn, location.pathname]);

  const closeMenus = () => {
    setShowOffcanvas(false);
    setShowMobileMenu(false);
  };

  const openAuthModal = () => {
    closeMenus();
    setShowAuthModal(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    closeMenus();
    // Lets other components (e.g. the quiz page) react to the logout.
    window.dispatchEvent(new CustomEvent("userLogout"));
    navigate("/");
  };

  const renderLinks = (links, className) =>
    links.map(([path, label]) => (
      <Link key={path} to={path} className={className} onClick={closeMenus}>
        {label}
      </Link>
    ));

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
              <Link
                to="/notifications"
                className="btn btn-outline-secondary btn-sm nav-icon-button"
                aria-label="Notifications"
              >
                <span className="notification-icon">🔔</span>
                {notificationCount > 0 && (
                  <span className="notification-badge">{notificationCount}</span>
                )}
              </Link>
            )}

            <Navbar expand={false}>
              <Navbar.Toggle
                aria-controls="offcanvasNavbar"
                onClick={() => setShowOffcanvas(!showOffcanvas)}
              />
              <Navbar.Offcanvas
                id="offcanvasNavbar"
                aria-labelledby="offcanvasNavbarLabel"
                placement="end"
                show={showOffcanvas}
                onHide={() => setShowOffcanvas(false)}
              >
                <Offcanvas.Header closeButton>
                  <Offcanvas.Title id="offcanvasNavbarLabel">
                    {isLoggedIn && getUsername() ? `Welcome, ${getUsername()}` : "Menu"}
                  </Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                  <Nav className="flex-column">
                    {renderLinks(PUBLIC_LINKS, "nav-link mb-2")}
                    {isLoggedIn && renderLinks(MEMBER_LINKS, "nav-link mb-2")}
                    <Button
                      variant="outline-primary"
                      onClick={isLoggedIn ? handleLogout : openAuthModal}
                      className="mb-3"
                    >
                      {isLoggedIn ? "Log Out" : "Log In or Sign Up"}
                    </Button>
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
            onClick={() => setShowMobileMenu(!showMobileMenu)}
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
        <nav id="mobile-menu-content" className="mobile-menu-content" aria-label="Mobile menu">
          {renderLinks(PUBLIC_LINKS, "mobile-menu-item")}
          <div className="mobile-menu-divider"></div>
          {isLoggedIn && (
            <>
              {renderLinks(MEMBER_LINKS, "mobile-menu-item")}
              <div className="mobile-menu-divider"></div>
            </>
          )}
          <button
            className="mobile-menu-item mobile-menu-button"
            onClick={isLoggedIn ? handleLogout : openAuthModal}
          >
            {isLoggedIn ? "Log Out" : "Log In or Sign Up"}
          </button>
        </nav>
      )}
      <AuthModal
        show={showAuthModal}
        handleClose={() => setShowAuthModal(false)}
        setIsLoggedIn={setIsLoggedIn}
      />
    </>
  );
}

export default Header;
