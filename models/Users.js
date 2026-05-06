import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    phone: String,
    password: String,
    otp: String,
    otpExpiry: Date,
    resetToken: String,
    resetTokenExpiry: Date,
});

export default mongoose.model("User", userSchema);