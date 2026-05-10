import Appointment from "../models/Appointment.js";

export const createAppointment = async (req, res) => {
  console.log("Creating appointment for user:", req.user.id);
  console.log("Request body:", req.body);
  try {
    const { service, doctor, date, time, price, status } = req.body;

    // Timezone-safe availability check
    const appointmentDate = new Date(date);
    const startOfDay = new Date(
      Date.UTC(
        appointmentDate.getUTCFullYear(),
        appointmentDate.getUTCMonth(),
        appointmentDate.getUTCDate(),
        0, 0, 0, 0
      )
    );
    const endOfDay = new Date(
      Date.UTC(
        appointmentDate.getUTCFullYear(),
        appointmentDate.getUTCMonth(),
        appointmentDate.getUTCDate(),
        23, 59, 59, 999
      )
    );

    const exists = await Appointment.findOne({
      doctor,
      time,
      date: { $gte: startOfDay, $lte: endOfDay },
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
      status: status || "Confirmed",  // ← status save karo
    });

    res.json({ message: "Appointment booked", appointment });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};