import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access Denied: No Token Provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user data (e.g., user ID) to request
    next(); // Allow the request to proceed to the next middleware or route handler
  } catch (error) {
    res.status(403).json({ message: 'Invalid Token' });
  }
};

export default authMiddleware;
