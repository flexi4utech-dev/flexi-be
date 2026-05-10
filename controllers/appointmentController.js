import Appointment from "../models/Appointment.js";

export const createAppointment = async (req, res) => {
    console.log("Creating appointment for user:", req.user.id);
    console.log("Request body:", req.body);
    try {
        const { service, doctor, date, time, price } = req.body;

        // availability check (IMPORTANT 🔥)
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const exists = await Appointment.findOne({
            doctor,
            time,
            date: {
                $gte: startOfDay,
                $lte: endOfDay,
            },
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