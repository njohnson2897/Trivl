import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Nav, Button, Offcanvas } from 'react-bootstrap';
import AuthModal from './AuthModal.jsx'; // Assuming AuthModal is in the same folder

function Header() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [showOffcanvas, setShowOffcanvas] = useState(false);

  const handleShowAuthModal = () => setShowAuthModal(true);
  const handleCloseAuthModal = () => setShowAuthModal(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setShowOffcanvas(false); // Close the menu on logout
  };

  const toggleOffcanvas = () => setShowOffcanvas(!showOffcanvas);

  return (
    <header
      className="header d-flex justify-content-between align-items-center px-3 py-2"
      style={{
        height: '60px',
        borderBottom: '1px solid #ccc',
        position: 'relative',
      }}
    >
      <Link to="/" className="header-title">
        TRIVL
      </Link>
      <Navbar expand={false} className="p-0 m-0">
        <Navbar.Toggle
          aria-controls="offcanvasNavbar"
          onClick={toggleOffcanvas}
          style={{ position: 'absolute', right: '5px' }}
        />
        <Navbar.Offcanvas
          id="offcanvasNavbar"
          aria-labelledby="offcanvasNavbarLabel"
          placement="end"
          show={showOffcanvas}
          onHide={toggleOffcanvas}
        >
          <Offcanvas.Header closeButton>
            <Offcanvas.Title id="offcanvasNavbarLabel">Menu</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <Nav className="flex-column">
              {/* Universal Links */}
              <Link to="/leaderboard" className="nav-link mb-2">
                Leaderboard
              </Link>
              <Link to="/settings" className="nav-link mb-2">
                Settings
              </Link>
              <Link to="/help" className="nav-link mb-2">
                Help/Support
              </Link>
              <Link to="/instructions" className="nav-link mb-2">How to Play</Link>
              {/* Authenticated User Actions */}
              {isLoggedIn ? (
                <>
                  <Link to="/profile" className="nav-link mb-2">
                    Profile
                  </Link>
                  <Link to="/friends" className="nav-link mb-2">
                    Friend List
                  </Link>
                  <Link to="/quiz-history" className="nav-link mb-2">
                    Quiz History
                  </Link>
                  <Link to="/achievements" className="nav-link mb-2">
                    Achievements
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
      <AuthModal
        show={showAuthModal}
        handleClose={handleCloseAuthModal}
        setIsLoggedIn={setIsLoggedIn}
      />
    </header>
  );
}

export default Header;
