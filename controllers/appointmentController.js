import Appointment from "../models/Appointment.js";

// ─── Helper: UTC-safe day boundaries ───────────────────────────────────────
function getDayBounds(dateInput) {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return null;
  const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
  const end   = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23, 59, 59, 999));
  return { start, end };
}

// ─── POST /api/appointments ────────────────────────────────────────────────
export const createAppointment = async (req, res) => {
  try {
    const { service, doctor, date, time, price, status } = req.body;

    // Validate required fields
    if (!service || !doctor || !date || !time || !price) {
      return res.status(400).json({ message: "All fields are required: service, doctor, date, time, price" });
    }

    const bounds = getDayBounds(date);
    if (!bounds) {
      return res.status(400).json({ message: "Invalid date provided" });
    }

    // Check if slot is already taken
    const exists = await Appointment.findOne({
      doctor,
      time,
      status: { $ne: "cancelled" }, // cancelled slots can be rebooked
      date: { $gte: bounds.start, $lte: bounds.end },
    });

    if (exists) {
      return res.status(400).json({ message: "This slot is already booked. Please choose another time." });
    }

    const appointment = await Appointment.create({
      user: req.user.id,
      service,
      doctor,
      date: new Date(date),
      time,
      price,
      status: status || "Confirmed",
    });

    return res.status(201).json({ message: "Appointment booked successfully", appointment });
  } catch (err) {
    console.error("createAppointment error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ─── GET /api/appointments/my ──────────────────────────────────────────────
// Returns all appointments for the logged-in user, sorted by date desc
export const getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ user: req.user.id })
      .sort({ date: -1 }) // newest first
      .lean();

    return res.json(appointments);
  } catch (err) {
    console.error("getMyAppointments error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ─── GET /api/appointments?doctor=...&date=... ────────────────────────────
// Used by BookAppointment to check which slots are already booked
export const getAppointments = async (req, res) => {
  try {
    const { doctor, date } = req.query;

    if (!doctor || !date) {
      return res.status(400).json({ message: "doctor and date query params are required" });
    }

    const bounds = getDayBounds(date);
    if (!bounds) {
      return res.status(400).json({ message: "Invalid date provided" });
    }

    const appointments = await Appointment.find({
      doctor,
      status: { $ne: "cancelled" }, // don't block cancelled slots
      date: { $gte: bounds.start, $lte: bounds.end },
    })
      .select("time status") // only return what frontend needs
      .lean();

    return res.json(appointments);
  } catch (err) {
    console.error("getAppointments error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ─── PUT /api/appointments/:id ─────────────────────────────────────────────
// Used for: cancel (status → cancelled), reschedule, etc.
export const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason, date, time } = req.body;

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Only owner can update
    if (appointment.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Prevent re-cancelling
    if (appointment.status === "cancelled" && status === "cancelled") {
      return res.status(400).json({ message: "Appointment is already cancelled" });
    }

    // If rescheduling, check new slot availability
    if (date && time) {
      const bounds = getDayBounds(date);
      if (bounds) {
        const conflict = await Appointment.findOne({
          _id: { $ne: id }, // exclude current appointment
          doctor: appointment.doctor,
          time,
          status: { $ne: "cancelled" },
          date: { $gte: bounds.start, $lte: bounds.end },
        });
        if (conflict) {
          return res.status(400).json({ message: "This slot is already booked. Choose another time." });
        }
        appointment.date = new Date(date);
        appointment.time = time;
      }
    }

    if (status) appointment.status = status;
    if (reason) appointment.reason = reason;

    await appointment.save();

    return res.json({ message: "Appointment updated successfully", appointment });
  } catch (err) {
    console.error("updateAppointment error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ─── DELETE /api/appointments/:id ──────────────────────────────────────────
// Hard delete — only for admin use (optional)
export const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (appointment.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await appointment.deleteOne();
    return res.json({ message: "Appointment deleted" });
  } catch (err) {
    console.error("deleteAppointment error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};