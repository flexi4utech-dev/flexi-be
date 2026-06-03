import User from "../models/Users.js"; // Aapka user model path yahan dalein

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private (Logged in users only)
export const updateProfile = async (req, res) => {
  console.log("--- 🚀 Backend UpdateProfile Started ---");

  // 1. Check Request Body (Frontend se kya data aaya)
  console.log("DEBUG 1: req.body received ->", req.body);

  // 2. Check Authenticated User (Middleware ne token se kya ID nikali)
  // Agar req.user undefined hai, toh aapka protect middleware sahi kaam nahi kar raha.
  console.log("DEBUG 2: req.user from middleware ->", req.user);

  try {
    const { name, phone } = req.body;

    if (!req.user || !req.user.id) {
        console.log("❌ ERROR: req.user.id is missing! Auth middleware issue.");
        return res.status(401).json({ message: "Not authorized, no user ID" });
    }

    const userId = req.user.id; 
    console.log(`DEBUG 3: Attempting to find user in DB with ID: ${userId}`);

    // 3. Find User in DB
    const user = await User.findById(userId);

    if (!user) {
      console.log("❌ ERROR: User not found in database for this ID.");
      return res.status(404).json({ message: "User not found" });
    }
    console.log("DEBUG 4: User found in DB. Current DB Data ->", { name: user.name, phone: user.phone });

    // 4. Update Logic (Check karein ki values change ho rahi hain ya nahi)
    let isChanged = false;

    if (name && name !== user.name) {
      console.log(`DEBUG 5a: Updating name from '${user.name}' to '${name}'`);
      user.name = name;
      isChanged = true;
    } else if (name === user.name) {
        console.log("DEBUG 5a: Name is same as DB, no change.");
    }

    if (phone && phone !== user.phone) {
      console.log(`DEBUG 5b: Updating phone from '${user.phone}' to '${phone}'`);
      user.phone = phone;
      isChanged = true;
    } else if (phone === user.phone) {
        console.log("DEBUG 5b: Phone is same as DB, no change.");
    }

    if (!isChanged) {
        console.log("⚠️ WARNING: No changes detected. Database save will not be triggered (Mongoose optimal optimization).");
    }

    // 5. Save to Database
    console.log("DEBUG 6: About to call user.save()...");
    const updatedUser = await user.save();
    console.log("✅ SUCCESS: user.save() completed.");
    
    // 6. Final Data Check (Save hone ke baad DB ne kya return kiya)
    console.log("DEBUG 7: Updated User Data from DB ->", { name: updatedUser.name, phone: updatedUser.phone });

    // Response bhejne se pehle timestamps check karein (updatedAt change hona chahiye)
    console.log("DEBUG 8: Timestamps ->", { createdAt: updatedUser.createdAt, updatedAt: updatedUser.updatedAt });

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
    console.log("❌ CRITICAL ERROR inside catch block:");
    console.error(error); // Pure error stack trace ko print karein

    // MongoDB matching errors (like unique constraint if you added it to phone later)
    if (error.code === 11000) {
        console.log("❌ ERROR: Duplicate key error (maybe phone number already exists).");
        return res.status(400).json({ message: "Phone number already in use" });
    }

    res.status(500).json({ message: "Server error while updating profile" });
  } finally {
    console.log("--- 🏁 Backend UpdateProfile Finished ---");
  }
};