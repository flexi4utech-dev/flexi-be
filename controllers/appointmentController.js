import Appointment from "../models/Appointment.js";

export const createAppointment = async (req, res) => {
  try {
    const { service, doctor, date, time, price } = req.body;

    // availability check (IMPORTANT 🔥)
    const exists = await Appointment.findOne({
      doctor,
      date,
      time,
    });

    if (exists) {
      return res.status(400).json({ message: "Slot already booked" });
    }

    const appointment = await Appointment.create({
      user: req.user.id,
      service,
      doctor,
      date,
      time,
      price,
    });

    res.json({ message: "Appointment booked", appointment });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};