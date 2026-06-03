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
    role: {
      type: String,
      enum: ["user", "doctor", "admin"],
      default: "user",
    },

    appointmentsCount: { type: Number, default: 0 },
    reportsCount:      { type: Number, default: 0 },
    joinedYear:       { type: Number, default: new Date().getFullYear() }, 

    bloodGroup: { type: String, trim: true, default: "" },
    height:     { type: String, trim: true, default: "" }, 
    weight:     { type: String, trim: true, default: "" }, 
    age:        { type: String, trim: true, default: "" }, 
    bmi:        { type: String, trim: true, default: "" },
    conditions: { type: String, trim: true, default: "None" },

    otp:       { type: String, default: null },
    otpExpiry: { type: Date,   default: null },
    resetToken:       String,
    resetTokenExpiry: Date,
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);