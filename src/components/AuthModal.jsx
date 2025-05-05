import { useState, useEffect, useCallback } from "react";
import { Modal, Button, Form, ButtonGroup } from "react-bootstrap";
import axios from "../../axiosConfig.js";
import { debounce } from "../utils/helpers.js";

function AuthModal({ show, handleClose, setIsLoggedIn }) {
  const [isRegistering, setIsRegistering] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState({
    available: null,
    message: "",
  });

  const checkUsernameAvailability = useCallback(
    debounce(async (username) => {
      if (!username || username.length < 3) {
        setUsernameStatus({
          available: null,
          message: "",
        });
        return;
      }

      setIsCheckingUsername(true);
      try {
        const response = await axios.get(
          `/api/users/check-username/${username}`
        );
        setUsernameStatus({
          available: response.data.available,
          message: response.data.available
            ? "Username is available"
            : "Username is already taken",
        });
      } catch (err) {
        setUsernameStatus({
          available: false,
          message: "Error checking username availability",
        });
      } finally {
        setIsCheckingUsername(false);
      }
    }, 500),
    []
  );

  useEffect(() => {
    if (isRegistering) {
      checkUsernameAvailability(username);
    }
  }, [username, isRegistering, checkUsernameAvailability]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isRegistering && !usernameStatus.available) {
      setError("Please choose a different username");
      return;
    }

    const endpoint = isRegistering ? "/api/users/register" : "/api/users/login";

    try {
      const requestData = isRegistering
        ? { username, email, password }
        : { username, password };

      const response = await axios.post(endpoint, requestData);

      if (isRegistering) {
        const loginResponse = await axios.post("/api/users/login", {
          username,
          password,
        });
        localStorage.setItem("token", loginResponse.data.token);
        setIsLoggedIn(true);
        setUsername("");
        setEmail("");
        setPassword("");
      } else {
        localStorage.setItem("token", response.data.token);
        setIsLoggedIn(true);
        setUsername("");
        setPassword("");
        setEmail("");
      }

      setError(null);
      handleClose();
    } catch (err) {
      setError(err.response?.data?.error || "An error occurred");
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered className="auth-modal">
      <Modal.Body className="p-4">
        <div className="auth-header mb-4">
          <h2 className="text-center mb-3">
            {isRegistering ? "Create Account" : "Welcome Back"}
          </h2>
          <p className="text-center text-muted">
            {isRegistering
              ? "Join our community of trivia enthusiasts"
              : "Sign in to continue your trivia journey"}
          </p>
        </div>

        <ButtonGroup className="w-100 mb-4">
          <Button
            variant={isRegistering ? "dark" : "outline-dark"}
            onClick={() => setIsRegistering(true)}
            className="py-2"
          >
            Sign Up
          </Button>
          <Button
            variant={!isRegistering ? "dark" : "outline-dark"}
            onClick={() => setIsRegistering(false)}
            className="py-2"
          >
            Log In
          </Button>
        </ButtonGroup>

        <Form onSubmit={handleSubmit} className="auth-form">
          <Form.Group className="mb-3">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className={`form-control-lg ${
                isRegistering && usernameStatus.available !== null
                  ? usernameStatus.available
                    ? "is-valid"
                    : "is-invalid"
                  : ""
              }`}
              placeholder="Enter your username"
            />
            {isRegistering && username && (
              <div
                className={`${
                  usernameStatus.available
                    ? "valid-feedback"
                    : "invalid-feedback"
                }`}
              >
                {isCheckingUsername ? (
                  <span className="text-muted">Checking availability...</span>
                ) : (
                  usernameStatus.message
                )}
              </div>
            )}
          </Form.Group>

          {isRegistering && (
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="form-control-lg"
                placeholder="Enter your email"
              />
            </Form.Group>
          )}

          <Form.Group className="mb-4">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-control-lg"
              placeholder="Enter your password"
            />
          </Form.Group>

          {error && (
            <div className="alert alert-danger mb-4" role="alert">
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="dark"
            size="lg"
            className="w-100 py-2"
            disabled={isRegistering && !usernameStatus.available}
          >
            {isRegistering ? "Create Account" : "Sign In"}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default AuthModal;
