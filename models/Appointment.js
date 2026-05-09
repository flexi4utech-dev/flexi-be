import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    service: String,
    doctor: String,
    date: Date,
    time: String,
    price: String,
  },
  { timestamps: true }
);

export default mongoose.model("Appointment", appointmentSchema);