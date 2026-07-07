import dotenv from 'dotenv';
dotenv.config(); //pulls in configuration from .env

import express from "express";
import cors from 'cors';
import authRoutes from "./routes/authRoutes";
import hospitalRoutes from "./routes/hospitalRoutes";
import patientRoutes from "./routes/patientRoutes";
import path from "path";
import rateLimit from "express-rate-limit";
import { Request, Response, NextFunction } from "express";

//load configuration setup
dotenv.config(); //pulls in configuration from .env

//create the app
const app = express();


app.use(cors());
app.use(express.json());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Too many attempts, please try again later." },
});

app.use("/api/auth", authLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/hospital", hospitalRoutes);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use("/api/patient", patientRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "MeroHealth backend is running" });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});