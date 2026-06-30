import { Router } from "express";
import { registerHospital, registerPatient, approveUser, rejectUser, login } from "../controllers/authController";


const router = Router();

router.post("/register/hospital", registerHospital);
router.post("/register/patient", registerPatient);
router.get("/approve/:token", approveUser);
router.get("/reject/:token", rejectUser);
router.post("/login", login);

export default router;