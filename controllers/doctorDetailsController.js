import Doctor from "../models/Doctor.js";

// @desc    Get all approved doctors (with filtering & search)
// @route   GET /api/doctors
// @access  Public
export const getAllDoctors = async (req, res) => {
  try {
    const { specialization, search, limit } = req.query;

    // Default query: Sirf un doctors ko dikhao jo Admin se approved hain
    let query = { role: "doctor", approved: true };

    // 1. Filter by Specialization (agar frontend se pass kiya gaya ho)
    if (specialization && specialization !== "All") {
      // Case-insensitive match ke liye regex use kar rahe hain
      query.specialization = { $regex: new RegExp(specialization, "i") };
    }

    // 2. Search by Name (agar koi search bar se doctor ka naam search kare)
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    // Database query banayein (Sensitve data jaise password, otp hide karein)
    let dbQuery = Doctor.find(query).select("-password -otp -otpExpiry");

    // 3. Limit (agar home page pe sirf top 4-5 doctors dikhane hon)
    if (limit) {
      dbQuery = dbQuery.limit(Number(limit));
    }

    // Query execute karein
    const doctors = await dbQuery;

    res.status(200).json({
      success: true,
      count: doctors.length,
      doctors,
    });
  } catch (error) {
    console.error("Error fetching all doctors:", error);
    res.status(500).json({ success: false, message: "Server error while fetching doctors" });
  }
};

// @desc    Get single doctor details by ID
// @route   GET /api/doctors/:id
// @access  Public
export const getDoctorById = async (req, res) => {
  try {
    const doctorId = req.params.id;

    // Database se doctor ko uski ID se find karein, aur password/otp hata dein
    const doctor = await Doctor.findById(doctorId).select("-password -otp -otpExpiry");

    // Agar user nahi mila, ya wo user doctor nahi hai
    if (!doctor || doctor.role !== "doctor") {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    // Check if doctor is approved before showing profile
    if (!doctor.approved) {
      return res.status(403).json({ success: false, message: "Doctor profile is under review" });
    }

    res.status(200).json({ success: true, doctor });
  } catch (error) {
    console.error("Error fetching doctor by ID:", error);
    
    // Agar Mongoose ko galat format ki ID milti hai (jese "1" badle "60b9b..."), toh crash na ho
    if (error.kind === "ObjectId") {
      return res.status(404).json({ success: false, message: "Invalid Doctor ID" });
    }
    
    res.status(500).json({ success: false, message: "Server error while fetching doctor details" });
  }
};

export const updateDoctorProfile = async (req, res) => {
  try {
    const doctorId = req.user.id; // protectRole middleware se aayega
    const updates = req.body;

    // Security: Protect sensitive fields from being updated directly via this route
    delete updates.password;
    delete updates.role;
    delete updates.approved;
    delete updates.email; // Email change usually requires OTP verification, so we block it here
    delete updates.otp;
    delete updates.otpExpiry;

    // Find and update the doctor
    const updatedDoctor = await Doctor.findByIdAndUpdate(
      doctorId,
      { $set: updates },
      { new: true, runValidators: true } // new: true returns the updated document
    ).select("-password -otp -otpExpiry");

    if (!updatedDoctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    res.status(200).json({ success: true, message: "Profile updated successfully", doctor: updatedDoctor });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ success: false, message: "Server error while updating profile" });
  }
};