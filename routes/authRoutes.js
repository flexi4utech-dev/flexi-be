import express from "express";
import {
  login,
  register,
  sendOtp,
  verifyOtp,
  resetPasswordWithOtp,
  doctorRegister,
  doctorLogin,
} from "../controllers/authController.js";

const router = express.Router();

// ─── Patient Auth ────────────────────────────────────────────────────────────
router.post("/login",          login);
router.post("/register",       register);

// ─── Doctor Auth ─────────────────────────────────────────────────────────────
router.post("/doctor-login",    doctorLogin);
router.post("/doctor-register", doctorRegister);

// ─── OTP (shared — works for both user & doctor) ─────────────────────────────
router.post("/send-otp",           sendOtp);
router.post("/verify-otp",         verifyOtp);
router.post("/reset-password-otp", resetPasswordWithOtp);
router.post("/reset-password",     resetPasswordWithOtp); // backward compat

export default router;