import mongoose from "mongoose";

// ✅ Alag Doctor model — user se alag collection
const doctorSchema = new mongoose.Schema(
  {
    // ─── PERSONAL INFO ───
    name:           { type: String, trim: true, required: true },
    email:          { type: String, unique: true, lowercase: true, trim: true, required: true },
    phone:          { type: String, trim: true },
    age:            { type: Number },
    password:       { type: String, required: true },

    // ─── PROFESSIONAL INFO (From Registration Step) ───
    specialization: { type: String, trim: true },
    experience:     { type: String, trim: true }, // e.g. "8+ Years"
    fees:           { type: Number, default: 0 },
    certificate:    { type: String, trim: true }, // Doctor's uploaded document URL

    // ─── PUBLIC PROFILE DETAILS (For DoctorDetails.tsx Page) ───
    about:          { type: String, trim: true, default: "" },
    clinic:         { type: String, trim: true, default: "Flexi4U Wellness Center" },
    workingHours:   { type: String, trim: true, default: "Mon - Sat, 10:00 AM - 07:00 PM" },
    
    // Arrays for multiple values
    languages:      [{ type: String, trim: true, default: "English" }],
    expertise:      [{ type: String, trim: true }], // e.g. ["Sports Injury", "Dry Needling"]
    
    // Education Array (Matching frontend UI exactly)
    education: [
      {
        degree:    { type: String, trim: true },
        institute: { type: String, trim: true },
        year:      { type: String, trim: true }
      }
    ],

    // ─── STATS & STATUS ───
    rating:         { type: Number, default: 0, min: 0, max: 5 }, // 0 to 5 stars
    reviewsCount:   { type: Number, default: 0 },
    available:      { type: Boolean, default: true }, // Currently Available or Busy

    // ─── SYSTEM SETTINGS ───
    role: {
      type: String,
      default: "doctor", // ✅ Role always "doctor"
    },
    approved: {
      type: Boolean,
      default: false, // Admin has to approve them first
    },

    // ─── OTP / SECURITY ───
    otp:            { type: String, default: null },
    otpExpiry:      { type: Date,   default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Doctor", doctorSchema);