import express from "express";
import {
    login, 
    register, 
    sendOtp,
    verifyOtp,
    resetPasswordWithOtp,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPasswordWithOtp);
export default router;