import { Router } from "express";
import { registerHospital, registerPatient } from "../controllers/authController";


const router = Router();

router.post("/register/hospital", registerHospital);
router.post("/register/patient", registerPatient);

export default router;