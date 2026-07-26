import { Router } from "express";
import { registerHospital, registerPatient, approveUser, rejectUser, login } from "../controllers/authController";
import { uploadAvatar } from "../utils/upload";

const router = Router();

router.post("/register/hospital", uploadAvatar.single("avatar"), registerHospital);
router.post("/register/patient", uploadAvatar.single("avatar"), registerPatient);
router.get("/approve/:token", approveUser);
router.get("/reject/:token", rejectUser);
router.post("/login", login);

export default router;