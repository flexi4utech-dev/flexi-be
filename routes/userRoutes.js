import express from "express";
import { updateProfile, getProfile } from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js"; 

const router = express.Router();

router.put("/profile", protect, updateProfile);
router.get("/profile", protect, getProfile);

export default router;