import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthModal from './AuthModal.jsx'; // Assuming AuthModal is in the same folder

function Header() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

  const handleShowAuthModal = () => setShowAuthModal(true);
  const handleCloseAuthModal = () => setShowAuthModal(false);
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
  };

  return (
    <header className="header">
      <div className="header-section"></div>
      <Link to="/" className="header-title">TRIVL</Link>
      <div className="header-section text-end">
        <button onClick={() => {}} className="btn btn-outline-primary me-3">How to Play</button>
        {isLoggedIn ? (
          <button onClick={handleLogout} className="btn btn-outline-primary">Log Out</button>
        ) : (
          <button onClick={handleShowAuthModal} className="btn btn-outline-primary">Log In or Sign Up</button>
        )}
      </div>
      <AuthModal show={showAuthModal} handleClose={handleCloseAuthModal} setIsLoggedIn={setIsLoggedIn} />
    </header>
  );
}

export default Header;
