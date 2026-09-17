const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config");

function decodeToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { error: "Unauthorized" };
  }

  const token = authHeader.split(" ")[1];
  try {
    return { payload: jwt.verify(token, jwtSecret) };
  } catch (error) {
    return { error: "Invalid or expired token" };
  }
}

function requireAuth(req, res, next) {
  const { payload, error } = decodeToken(req);
  if (error) return res.status(401).json({ message: error });
  req.user = payload;
  return next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    const { payload, error } = decodeToken(req);
    if (error) return res.status(401).json({ message: error });
    if (!roles.includes(payload.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    req.user = payload;
    return next();
  };
}

function requireAdmin(req, res, next) {
  return requireRole("admin")(req, res, next);
}

module.exports = { requireAuth, requireRole, requireAdmin };
