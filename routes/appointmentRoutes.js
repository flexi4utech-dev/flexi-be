import express from "express";
import {
  createAppointment,
  getMyAppointments,
  getAppointments,
  updateAppointment,
  deleteAppointment,
} from "../controllers/appointmentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/my", protect, getMyAppointments);      // GET /api/appointments/my
router.get("/", getAppointments);                    // GET /api/appointments?doctor=&date=  (no auth — slot check)
router.post("/", protect, createAppointment);        // POST /api/appointments
router.put("/:id", protect, updateAppointment);      // PUT /api/appointments/:id
router.delete("/:id", protect, deleteAppointment);   // DELETE /api/appointments/:id

export default router;