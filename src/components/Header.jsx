import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthModal from './AuthModal.jsx'; // Assuming AuthModal is in the same folder

function Header() {
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleShowAuthModal = () => setShowAuthModal(true);
  const handleCloseAuthModal = () => setShowAuthModal(false);

  return (
    <header className="header">
      <div className="header-section"></div>
      <Link to="/" className="header-title">TRIVL</Link>
      <div className="header-section text-end">
        <button onClick={handleShowAuthModal} className="btn btn-outline-primary">Log In or Sign Up</button>
      </div>
      <AuthModal show={showAuthModal} handleClose={handleCloseAuthModal} />
    </header>
  );
}

export default Header;