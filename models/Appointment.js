import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    service: {
      type: String,
      required: [true, "Service is required"],
      trim: true,
    },
    doctor: {
      type: String,
      required: [true, "Doctor is required"],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    time: {
      type: String,
      required: [true, "Time is required"],
      trim: true,
    },
    price: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Confirmed", "Pending", "cancelled"],
      default: "Confirmed",
    },
    reason: {
      type: String,
      trim: true,
      default: null,
    },
    location: {
      type: String,
      trim: true,
      default: "Flexi4U Clinic",
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes for fast queries ───────────────────────────────────────────────

// Used by getMyAppointments — fetch all appointments for a user
appointmentSchema.index({ user: 1, date: -1 });

// Used by createAppointment & getAppointments — check slot availability
appointmentSchema.index({ doctor: 1, date: 1, time: 1 });

// Used by status filtering (upcoming/past/cancelled tabs)
appointmentSchema.index({ user: 1, status: 1 });

// ─── Virtual: isUpcoming ────────────────────────────────────────────────────
appointmentSchema.virtual("isUpcoming").get(function () {
  return this.status !== "cancelled" && this.date > new Date();
});

export default mongoose.model("Appointment", appointmentSchema);