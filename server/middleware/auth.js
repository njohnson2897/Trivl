import jwt from "jsonwebtoken";

export const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access Denied: No Token Provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Validate that the token contains required user data
    if (!decoded.id) {
      return res.status(403).json({
        message: "Invalid Token: Missing user ID",
      });
    }

    req.user = decoded; // Attach user data (e.g., user ID) to request
    next(); // Allow the request to proceed to the next middleware or route handler
  } catch (error) {
    console.error("Token verification error:", error.message);
    res.status(403).json({ message: "Invalid Token" });
  }
};

// Like authenticateToken, but lets logged-out requests through (req.user stays
// undefined). A token that is present but invalid is still rejected, so an
// expired login doesn't silently turn into an anonymous one.
export const optionalAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return next();

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Invalid Token" });
  }
};
