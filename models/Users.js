import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name:   { 
        type: String, 
        trim: true 
    },

    email:  { 
        type: String, 
        unique: true, 
        lowercase: true, 
        trim: true 
    },

    phone:  { 
        type: String, 
        trim: true 
    },

    password: String,

    // ✅ role field add kiya — "user" | "doctor" | "admin"
    role: {
      type: String,
      enum: ["user", "doctor", "admin"],
      default: "user",
    },

    // OTP fields
    otp:       { type: String, default: null },
    otpExpiry: { type: Date,   default: null },

    // Reset token (unused but kept)
    resetToken:       String,
    resetTokenExpiry: Date,
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);