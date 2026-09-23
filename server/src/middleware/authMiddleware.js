import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "freelancer_jwt_secret_key_default_2026";

export function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authorization token missing or invalid format.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, email, role, full_name }
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Session expired or token invalid. Please log in again.",
    });
  }
}

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Requires one of roles: [${allowedRoles.join(", ")}]. Your role: ${req.user.role}`,
      });
    }

    next();
  };
}

export function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      req.user = jwt.verify(token, JWT_SECRET);
    } catch {
      // Ignore invalid optional token
      req.user = null;
    }
  }

  next();
}
