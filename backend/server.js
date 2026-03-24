import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import roomRoutes from "./routes/rooms.js";
import studentRoutes from "./routes/students.js";
import allocationRoutes from "./routes/allocations.js";
import paymentRoutes from "./routes/payments.js";
import dashboardRoutes from "./routes/dashboard.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet());

// CORS Configuration - Restrict to frontend origin
const allowedOrigin = process.env.FRONTEND_URL;

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true, // if you use cookies/auth
  }),
);

app.use(express.json());

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", apiLimiter);

// Stricter Rate Limiting for Login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login requests per windowMs
  message: "Too many login attempts, please try again after 15 minutes",
});
app.use("/api/auth/login", loginLimiter);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date() });
});
app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/allocations", allocationRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
