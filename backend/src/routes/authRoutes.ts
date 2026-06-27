import { Router } from "express";
import { registerHospital } from "../controllers/authController";

const router = Router();

router.post("/register/hospital", registerHospital);

export default router;