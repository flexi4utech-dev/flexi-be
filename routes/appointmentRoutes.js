import express from "express";
import { createAppointment } from "../controllers/appointmentController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createAppointment);

router.get("/", async (req, res) => {
  const { doctor, date } = req.query;

  const appointments = await Appointment.find({ doctor, date });

  res.json(appointments);
});

router.get("/my", protect, async (req, res) => {
  const appointments = await Appointment.find({
    user: req.user.id,
  });

  res.json(appointments);
});

router.delete("/:id", protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Not found" });
    }

    if (appointment.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await appointment.deleteOne();

    res.json({ message: "Appointment cancelled" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


export default router;