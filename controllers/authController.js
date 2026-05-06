import User from "../models/Users.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import otpGenerator from "otp-generator";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js";

// ================= REGISTER =================
export const register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      phone,
      password: hash,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ================= LOGIN =================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Wrong password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ================= SEND OTP =================
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const otp = otpGenerator.generate(6, {
      digits: true,
      alphabets: false,
      specialChars: false,
    });

    user.otp = otp;
    user.otpExpiry = Date.now() + 5 * 60 * 1000; // 5 min
    await user.save();

    await sendEmail(email, "Your OTP", `Your OTP is ${otp}`);

    res.json({ message: "OTP sent successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ================= VERIFY OTP =================
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (
      !user ||
      user.otp !== otp ||
      user.otpExpiry < Date.now()
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    res.json({ message: "OTP verified successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ================= FORGOT PASSWORD =================
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const token = crypto.randomBytes(32).toString("hex");

    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 10 * 60 * 1000; // 10 min
    await user.save();

    const resetLink = `http://localhost:5173/reset/${token}`;

    await sendEmail(email, "Reset Password", `Click here: ${resetLink}`);

    res.json({ message: "Reset link sent to email" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ================= RESET PASSWORD =================
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const hash = await bcrypt.hash(password, 10);

    user.password = hash;
    user.resetToken = null;
    user.resetTokenExpiry = null;

    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};