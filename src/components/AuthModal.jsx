import { useState } from 'react';
import { Modal, Tab, Tabs, Button, Form } from 'react-bootstrap';

function AuthModal({ show, handleClose }) {
  const [key, setKey] = useState('login'); // State to toggle between login and signup

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Body>
        {/* Toggle between Login and Signup using Tabs */}
        <Tabs
          id="auth-tabs"
          activeKey={key}
          onSelect={(k) => setKey(k)}
          className="mb-3 justify-content-center"
        >
          <Tab eventKey="login" title="Log In">
            <Form>
              <Form.Group className="mb-3" controlId="loginUsername">
                <Form.Label>Username</Form.Label>
                <Form.Control type="text" placeholder="Enter username" />
              </Form.Group>
              <Form.Group className="mb-3" controlId="loginPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control type="password" placeholder="Enter password" />
              </Form.Group>
              <Button variant="secondary" type="submit" className="w-100">
                Log In
              </Button>
            </Form>
          </Tab>
          <Tab eventKey="signup" title="Sign Up">
            <Form>
              <Form.Group className="mb-3" controlId="signupUsername">
                <Form.Label>Username</Form.Label>
                <Form.Control type="text" placeholder="Enter username" />
              </Form.Group>
              <Form.Group className="mb-3" controlId="signupPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control type="password" placeholder="Enter password" />
              </Form.Group>
              <Button variant="secondary" type="submit" className="w-100">
                Sign Up
              </Button>
            </Form>
          </Tab>
        </Tabs>
      </Modal.Body>
    </Modal>
  );
}

export default AuthModal;
