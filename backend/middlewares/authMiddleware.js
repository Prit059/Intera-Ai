const jwt = require("jsonwebtoken");
const User = require("../Models/User");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if(!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ 
        success: false,
        message: "No token provided" 
      });
    }

    const token = authHeader.split(" ")[1];
    if(!token){
      return res.status(401).json({
        success: false,
        message: "Invalid Token Format"
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if(!decoded.id){
        return res.status(401).json({ 
          success: false,
          message: "Invalid token payload" 
        });
      }

      const user = await User.findById(decoded.id).select("-password -verificationToken -verificationTokenExpiry -passwordResetToken -passwordResetTokenExpiry");

      if(!user){
        return res.status(401).json({ 
          success: false,
          message: "User not found" 
        });
      }

      if(!user.isActive || !user.emailverified){
        return res.status(401).json({
          success: false,
          message: "Account not verified or deactivated"
        });
      }

      req.user = user;
      next();
    } catch(jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          success: false,
          message: "Token expired, please login again" 
        });
      }
      
      return res.status(401).json({ 
        success: false,
        message: "Invalid token" 
      });
    }
  } catch (error) {
    return res.status(500).json({ 
      success: false,
      message: "Authentication server error"
    });
  }
};

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false,
        message: "Forbidden: insufficient permissions" 
      });
    }
    next();
  };
};

module.exports = { protect, requireRole };