import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import passport from "./config/passport.js";

import authRoutes        from "./routes/authRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import doctorRoutes      from "./routes/doctorRoutes.js";

dotenv.config();

const app = express();

// ─── Middlewares ─────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || "secret",
  resave: false,
  saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());

// ─── DB Connect ──────────────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use("/api/auth",         authRoutes);         // login, register, otp
app.use("/api/appointments", appointmentRoutes);  // user appointments
app.use("/api/doctors",      doctorRoutes);       // doctor dashboard routes

// ─── Test Route ──────────────────────────────────────────────────────────────
app.get("/", (req, res) => res.send("✅ Flexi4U API Running"));

// ─── Google OAuth ────────────────────────────────────────────────────────────
app.get("/api/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
app.get("/api/auth/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => res.redirect(process.env.FRONTEND_URL || "http://localhost:5173")
);

// ─── Start Server ────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));