import User from "../models/Users.js";
import Doctor from "../models/Doctor.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/sendEmail.js";

// ─── Helper: generate JWT with role ─────────────────────────────────────────
const generateToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });

// ─── Helper: generate 6-digit OTP ───────────────────────────────────────────
const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// ════════════════════════════════════════════════════════════════════════════
//  USER AUTH
// ════════════════════════════════════════════════════════════════════════════

// POST /api/auth/register — Patient signup
export const register = async (req, res) => {
  console.log("Register endpoint hit", req.body);
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password)
      return res.status(400).json({ message: "All fields are required" });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "User already exists" });

    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({ name, email, phone, password: hash, role: "user" });

    const token = generateToken(user._id, user.role);

    return res.json({
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("register error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// POST /api/auth/login — Patient login only
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    // ✅ Doctors should use /api/auth/doctor-login
    if (user.role === "doctor") {
      return res.status(403).json({ message: "Please use the Doctor Login portal" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Wrong password" });

    const token = generateToken(user._id, user.role);

    return res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      },
    });
  } catch (err) {
    console.error("login error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ════════════════════════════════════════════════════════════════════════════
//  DOCTOR AUTH
// ════════════════════════════════════════════════════════════════════════════

// POST /api/auth/doctor-register — Doctor signup
export const doctorRegister = async (req, res) => {
  try {
    const { name, email, phone, age, specialization, experience, fees, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "Name, email, password required" });

    const exists = await Doctor.findOne({ email });
    if (exists) return res.status(400).json({ message: "Doctor already registered" });

    const hash = await bcrypt.hash(password, 10);

    const doctor = await Doctor.create({
      name, email, phone, age, specialization,
      experience, fees, password: hash,
      role: "doctor", approved: false,
    });

    return res.status(201).json({
      message: "Application submitted! Wait for admin approval.",
      doctor: { _id: doctor._id, name: doctor.name, email: doctor.email },
    });
  } catch (err) {
    console.error("doctorRegister error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// POST /api/auth/doctor-login — Doctor login only
export const doctorLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const doctor = await Doctor.findOne({ email });
    if (!doctor) return res.status(400).json({ message: "Doctor not found" });

    // ✅ Check approval
    if (!doctor.approved) {
      return res.status(403).json({ message: "Your account is pending admin approval" });
    }

    const match = await bcrypt.compare(password, doctor.password);
    if (!match) return res.status(400).json({ message: "Wrong password" });

    const token = generateToken(doctor._id, "doctor");

    return res.json({
      token,
      user: {
        _id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        role: "doctor",
        specialization: doctor.specialization,
      },
    });
  } catch (err) {
    console.error("doctorLogin error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ════════════════════════════════════════════════════════════════════════════
//  OTP — works for both User and Doctor
// ════════════════════════════════════════════════════════════════════════════

// POST /api/auth/send-otp
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    let account = await User.findOne({ email });
    let isDoctor = false;

    if (!account) {
      account = await Doctor.findOne({ email });
      isDoctor = true;
    }

    if (!account) return res.status(400).json({ message: "Account not found" });

    const otp = generateOtp();
    account.otp = otp;
    account.otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 min
    await account.save();


    const subject = `${otp} is your Flexi4U verification code`;
    
    const textContent = `Hello,\n\nYour Flexi4U verification code is: ${otp}\n\nThis code is valid for 5 minutes. If you did not request this, please safely ignore this email.\n\nBest,\nFlexi4U Team`;

    const htmlContent = `
      <div style="font-family: Helvetica, Arial, sans-serif; min-width: 1000px; overflow: auto; line-height: 2">
        <div style="margin: 50px auto; width: 70%; padding: 20px 0">
          <div style="border-bottom: 1px solid #eee">
            <a href="https://flexi4u.com" style="font-size: 1.4em; color: #00466a; text-decoration: none; font-weight: 600">Flexi4U</a>
          </div>
          <p style="font-size: 1.1em">Hi there,</p>
          <p>Thank you for choosing Flexi4U. Use the following OTP to complete your verification process. This OTP is valid for <strong>5 minutes</strong>.</p>
          <h2 style="background: #00466a; margin: 20px auto; width: max-content; padding: 10px 20px; color: #fff; border-radius: 4px; letter-spacing: 2px;">${otp}</h2>
          <p style="font-size: 0.9em; margin-top: 30px; color: #666;">If you didn't request this code, you can safely ignore this email. Your account is secure.</p>
          <hr style="border: none; border-top: 1px solid #eee" />
          <div style="float: left; padding: 8px 0; color: #aaa; font-size: 0.8em; line-height: 1; font-weight: 300">
            <p>Flexi4U Team</p>
            <p>Secure Account Services</p>
          </div>
        </div>
      </div>
    `;

    try {
      await sendEmail(email, subject, textContent, htmlContent);
    } catch (err) {
      console.log("EMAIL FAILED:", err);
      console.log("OTP fallback:", otp);
    }

    return res.json({ message: "OTP sent to email successfully" });
  } catch (err) {
    console.error("sendOtp error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// POST /api/auth/verify-otp
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    let account = await User.findOne({ email });
    if (!account) account = await Doctor.findOne({ email });

    if (!account)
      return res.status(400).json({ message: "Account not found" });

    if (account.otp !== otp || account.otpExpiry < Date.now())
      return res.status(400).json({ message: "Invalid or expired OTP" });

    return res.json({ message: "OTP verified" });
  } catch (err) {
    console.error("verifyOtp error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// POST /api/auth/reset-password-otp
export const resetPasswordWithOtp = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password)
      return res.status(400).json({ message: "All fields required" });

    let account = await User.findOne({ email });
    if (!account) account = await Doctor.findOne({ email });

    if (!account)
      return res.status(400).json({ message: "Account not found" });

    if (account.otp !== otp || account.otpExpiry < Date.now())
      return res.status(400).json({ message: "Invalid or expired OTP" });

    account.password = await bcrypt.hash(password, 10);
    account.otp = null;
    account.otpExpiry = null;
    await account.save();

    return res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("resetPasswordWithOtp error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
