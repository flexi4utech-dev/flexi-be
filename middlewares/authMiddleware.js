import jwt from "jsonwebtoken";
import User from "../models/Users.js";
import Doctor from "../models/Doctor.js";

// ─── Basic protect — sirf token verify karo ─────────────────────────────────
export const protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// ─── Role-based protect — specific role hi access kar sake ──────────────────
// Usage: protectRole("doctor") ya protectRole("admin")
export const protectRole = (...roles) => {
  return (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (!roles.includes(decoded.role)) {
        return res.status(403).json({
          message: `Access denied. Required role: ${roles.join(" or ")}`,
        });
      }

      req.user = decoded;
      next();
    } catch {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  };
};