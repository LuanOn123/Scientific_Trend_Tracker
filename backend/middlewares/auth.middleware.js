const jwt = require("jsonwebtoken");
const createError = require("http-errors");
const User = require("../models/User");

exports.protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : req.cookies?.token;
    if (!token) throw createError(401, "Authentication required");
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev_secret");
    const user = await User.findById(decoded.id).select("-passwordHash");
    if (!user || !user.isActive) throw createError(401, "Invalid or inactive user");
    req.user = user;
    next();
  } catch (error) {
    next(createError(401, error.message || "Invalid token"));
  }
};

exports.allowRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(createError(403, "You do not have permission to access this resource"));
  }
  return next();
};
