import { useState } from 'react';
import { Modal, Button, Form, ButtonGroup } from 'react-bootstrap';
import axios from '../../axiosConfig.js';

function AuthModal({ show, handleClose }) {
  const [isRegistering, setIsRegistering] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isRegistering ? '/api/users/register' : '/api/users/login';
    
    try {
      const response = await axios.post(endpoint, { username, password });
      if (!isRegistering) {
        // Store the JWT in local storage on login
        localStorage.setItem('token', response.data.token);
      }
      setError(null);
      handleClose();
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Body>
        {/* Button group for toggling between Sign Up and Log In */}
        <ButtonGroup className="w-100 mb-3">
          <Button 
            variant={isRegistering ? "secondary" : "outline-secondary"} 
            onClick={() => setIsRegistering(true)}
          >
            Sign Up
          </Button>
          <Button 
            variant={!isRegistering ? "secondary" : "outline-secondary"} 
            onClick={() => setIsRegistering(false)}
          >
            Log In
          </Button>
        </ButtonGroup>

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mt-3">
            <Form.Label>Username</Form.Label>
            <Form.Control 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required 
            />
          </Form.Group>
          <Form.Group className="mt-3">
            <Form.Label>Password</Form.Label>
            <Form.Control 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </Form.Group>
          {error && <p className="text-danger mt-2">{error}</p>}
          <Button type="submit" className="mt-3" variant="secondary">
            {isRegistering ? 'Sign Up' : 'Log In'}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default AuthModal;
