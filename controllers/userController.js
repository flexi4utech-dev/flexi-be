import User from "../models/Users.js";

export const updateProfile = async (req, res) => {
  try {
    const { 
        name, phone,
        appointmentsCount, reportsCount, joinedYear, 
        bloodGroup, height, weight, age, bmi, conditions 
    } = req.body;

    const userId = req.user.id; 

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (appointmentsCount !== undefined) user.appointmentsCount = Number(appointmentsCount);
    if (reportsCount !== undefined) user.reportsCount = Number(reportsCount);
    if (joinedYear !== undefined) user.joinedYear = Number(joinedYear);
    if (bloodGroup !== undefined) user.bloodGroup = bloodGroup;
    if (height !== undefined) user.height = height;
    if (weight !== undefined) user.weight = weight;
    if (age !== undefined) user.age = age;
    if (bmi !== undefined) user.bmi = bmi;
    if (conditions !== undefined) user.conditions = conditions;

    const updatedUser = await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        appointmentsCount: updatedUser.appointmentsCount,
        reportsCount: updatedUser.reportsCount,
        joinedYear: updatedUser.joinedYear,
        bloodGroup: updatedUser.bloodGroup,
        height: updatedUser.height,
        weight: updatedUser.weight,
        age: updatedUser.age,
        bmi: updatedUser.bmi,
        conditions: updatedUser.conditions,
      },
    });

  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error while updating profile" });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("DEBUG: Fetching fresh profile for ->", user.email);
    res.status(200).json({ user });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};