import Doctor from "../models/Doctor.js";

// @desc    Get single doctor details by ID
// @route   GET /api/doctors/:id
// @access  Public
export const getDoctorById = async (req, res) => {
  try {
    const doctorId = req.params.id;

    // Database se doctor ko uski ID se find karein, aur password hata dein
    const doctor = await Doctor.findById(doctorId).select("-password");

    // Agar user nahi mila, ya wo user doctor nahi hai
    if (!doctor || doctor.role !== "doctor") {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.status(200).json({ doctor });
  } catch (error) {
    console.error("Error fetching doctor by ID:", error);
    
    // Agar Mongoose ko galat format ki ID milti hai (jese "1" badle "60b9b..."), toh crash na ho
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Doctor not found (Invalid ID)" });
    }
    
    res.status(500).json({ message: "Server error while fetching doctor details" });
  }
};