import mongoose from "mongoose";

// ✅ Alag Doctor model — user se alag collection
const doctorSchema = new mongoose.Schema(
  {
    name:           { type: String, trim: true, required: true },
    email:          { type: String, unique: true, lowercase: true, trim: true, required: true },
    phone:          { type: String, trim: true },
    password:       { type: String, required: true },
    specialization: { type: String, trim: true },
    experience:     { type: String, trim: true },
    fees:           { type: Number, default: 0 },
    age:            { type: Number },

    // ✅ Role always "doctor"
    role: {
      type: String,
      default: "doctor",
    },

    // Admin approval
    approved: {
      type: Boolean,
      default: false,
    },

    // OTP fields (same as user — forgot password)
    otp:       { type: String, default: null },
    otpExpiry: { type: Date,   default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Doctor", doctorSchema);