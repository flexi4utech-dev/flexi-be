import express from "express";
import { createAppointment } from "../controllers/appointmentController.js";
import { protect } from "../middlewares/authMiddleware.js";
import Appointment from "../models/Appointment.js";

const router = express.Router();

router.post("/", protect, createAppointment);

router.get("/", async (req, res) => {
  const { doctor, date } = req.query;

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const appointments = await Appointment.find({
    doctor,
    date: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  });

  res.json(appointments);
});

router.get("/my", protect, async (req, res) => {
  const appointments = await Appointment.find({
    user: req.user.id,
  });

  res.json(appointments);
});

router.put("/:id", protect, async (req, res) => {
  try {
    const { status, reason } = req.body;

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Not found" });
    }

    if (appointment.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not allowed" });
    }

    // 🔥 status update
    appointment.status = status;
    appointment.reason = reason;

    await appointment.save();

    // 🔥 doctor notify (simple log / hook)
    console.log(
      `Doctor notified: ${appointment.doctor} appointment cancelled`
    );

    res.json({ message: "Appointment cancelled", appointment });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


export default router;