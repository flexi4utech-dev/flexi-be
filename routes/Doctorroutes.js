import express from "express";
import { protectRole } from "../middlewares/authMiddleware.js";
import Doctor from "../models/Doctor.js";
import Appointment from "../models/Appointment.js";
import { getDoctorById } from "../controllers/doctorDetailsController.js";

const router = express.Router();

// ─── GET /api/doctors — PUBLIC — approved doctors list (for patient frontend) ─
router.get("/", async (req, res) => {
  try {
    const doctors = await Doctor.find({ approved: true })
      .select("-password -otp -otpExpiry")
      .lean();

    const mapped = doctors.map((d) => ({
      id:             d._id,
      name:           d.name,
      specialty:      d.specialization || "General",
      exp:            d.experience ? `${d.experience} yrs` : "—",
      fees:           `₹${d.fees || 0}`,
      feesNum:        d.fees || 0,
      phone:          d.phone || "",
      initials:       (d.name || "DR")
                        .split(" ")
                        .map((w) => w[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2),
      available:      true, // default available — extend later
      rating:         4.8,  // placeholder — extend with reviews later
      reviews:        0,
      languages:      ["English", "Hindi"],
      education:      d.specialization || "—",
    }));

    return res.json({ doctors: mapped });
  } catch (err) {
    console.error("get doctors error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Endpoint will be: /api/doctors/:id
router.get("/:id", getDoctorById);

// getAllDoctors route
router.get("/", getAllDoctors);


// All routes below require doctor role
const doctorOnly = protectRole("doctor");

// ─── GET /api/doctors/profile ────────────────────────────────────────────────
router.get("/profile", doctorOnly, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.user.id).select("-password -otp -otpExpiry");
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    return res.json({ doctor });
  } catch (err) {
    console.error("doctor profile error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// ─── GET /api/doctors/appointments ──────────────────────────────────────────
router.get("/appointments", doctorOnly, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.user.id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    // Appointments where doctor name matches
    const appointments = await Appointment.find({ doctor: doctor.name })
      .sort({ date: -1 })
      .populate("user", "name email phone")
      .lean();

    // Map to consistent shape for frontend
    const mapped = appointments.map((a) => ({
      _id:         a._id,
      patientName:  a.user?.name  || "Unknown",
      patientEmail: a.user?.email || "",
      patientPhone: a.user?.phone || "",
      date:         a.date,
      time:         a.time,
      status:       a.status?.toLowerCase(),
      notes:        a.reason,
      fee:          doctor.fees,
    }));

    return res.json({ appointments: mapped });
  } catch (err) {
    console.error("doctor appointments error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// ─── PATCH /api/doctors/appointments/:id/status ──────────────────────────────
router.patch("/appointments/:id/status", doctorOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["pending", "confirmed", "completed", "cancelled"];
    if (!allowed.includes(status))
      return res.status(400).json({ message: "Invalid status" });

    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ message: "Appointment not found" });

    appt.status = status;
    await appt.save();

    return res.json({ message: "Status updated", appointment: appt });
  } catch (err) {
    console.error("update status error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// ─── GET /api/doctors/patients ───────────────────────────────────────────────
router.get("/patients", doctorOnly, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.user.id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    // Unique patients who had appointments with this doctor
    const appointments = await Appointment.find({ doctor: doctor.name })
      .populate("user", "name email phone")
      .lean();

    const seen = new Set();
    const patients = [];
    for (const a of appointments) {
      if (a.user && !seen.has(String(a.user._id))) {
        seen.add(String(a.user._id));
        patients.push({
          _id:       a.user._id,
          name:      a.user.name,
          email:     a.user.email,
          phone:     a.user.phone,
          lastVisit: a.date,
        });
      }
    }

    return res.json({ patients });
  } catch (err) {
    console.error("doctor patients error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// ─── GET /api/doctors/analytics ─────────────────────────────────────────────
router.get("/analytics", doctorOnly, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.user.id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    const appointments = await Appointment.find({ doctor: doctor.name }).lean();

    const total     = appointments.length;
    const completed = appointments.filter((a) => a.status === "completed").length;
    const pending   = appointments.filter((a) => a.status === "pending").length;
    const cancelled = appointments.filter((a) => a.status === "cancelled").length;

    const totalEarnings   = completed * (doctor.fees || 0);

    const currMonth = new Date().toISOString().slice(0, 7);
    const monthlyCompleted = appointments.filter(
      (a) => a.status === "completed" && a.date?.toISOString?.().startsWith(currMonth)
    ).length;
    const monthlyEarnings = monthlyCompleted * (doctor.fees || 0);

    // Unique patients
    const uniquePatients = new Set(appointments.map((a) => String(a.user))).size;

    return res.json({
      analytics: {
        totalAppointments: total,
        completedAppointments: completed,
        pendingAppointments: pending,
        cancelledAppointments: cancelled,
        totalEarnings,
        monthlyEarnings,
        totalPatients: uniquePatients,
      },
    });
  } catch (err) {
    console.error("doctor analytics error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;