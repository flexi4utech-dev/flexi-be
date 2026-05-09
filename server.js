import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import session from "express-session";
import passport from "./config/passport.js";

import appointmentRoutes from "./routes/appointmentRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(session({
  secret: "secret",
  resave: false,
  saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());

// DB CONNECT
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// ROUTES Login & Register
app.use("/api", authRoutes);

// ROUTES Appointments
app.use("/api/appointments", appointmentRoutes);




// TEST ROUTE
app.get("/", (req, res) => {
  res.send("API Running...");
});

app.get("/api/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get("/api/auth/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    res.redirect("http://localhost:5173");
  }
);

// SERVER START
app.listen(process.env.PORT, () =>
  console.log(`Server running on ${process.env.PORT}`)
);