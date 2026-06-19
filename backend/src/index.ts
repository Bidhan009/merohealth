import express from "express";
import cors from 'cors';
import dotenv from 'dotenv';

//load configuration setup
dotenv.config(); //pulls in configuration from .env

//create the app
const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "MeroHealth backend is running" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});