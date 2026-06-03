import User from "../models/Users.js"; // Aapka user model path yahan dalein

export const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;

    // req.user.id auth middleware (JWT) se aana chahiye
    const userId = req.user.id; 

    // User ko database mein dhoondho
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Sirf allowed fields update karo
    if (name) user.name = name;
    if (phone) user.phone = phone;

    // Database mein save karo
    const updatedUser = await user.save();

    // Password aur sensitive data frontend pe mat bhejo
    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
      },
    });

  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error while updating profile" });
  }
};