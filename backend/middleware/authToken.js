const jwt = require("jsonwebtoken");


//JWT Verification
const authenticateToken = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1]; // Extract Bearer token

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach decoded user information to req.user
    next();
  } catch (error) {
    return res.status(400).json({ message: "Invalid token." });
  }
};



module.exports = authenticateToken;
