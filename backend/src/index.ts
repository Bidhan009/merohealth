import dotenv from 'dotenv';
dotenv.config(); //pulls in configuration from .env

import express from "express";
import cors from 'cors';
import authRoutes from "./routes/authRoutes";
import hospitalRoutes from "./routes/hospitalRoutes";
import patientRoutes from "./routes/patientRoutes";
import path from "path";

//load configuration setup
dotenv.config(); //pulls in configuration from .env

//create the app
const app = express();


app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/hospital", hospitalRoutes);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use("/api/patient", patientRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "MeroHealth backend is running" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});