import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/authMiddleware";
import {
  searchPatient,
  linkPatient,
  getLinkedPatients,
  getPatientEmergencyInfo,
  getHospitalProfile,
  updateHospitalProfile,
  uploadHospitalAvatar,
} from "../controllers/hospitalController";
import {
  createReport,
  getPatientReports,
  editReport,
  getSingleReport,
  getAllReports,
} from "../controllers/reportController";
import { upload, uploadAvatar } from "../utils/upload";
import { registerHospital } from "../controllers/authController";
const router = Router();

router.use(requireAuth);
router.use(requireRole("HOSPITAL"));

router.get("/patients/search", searchPatient);
router.get("/patients", getLinkedPatients);
router.post("/patients/link", linkPatient);
router.get("/patients/:patientId/emergency", getPatientEmergencyInfo);

router.post("/reports", upload.single("file"), createReport);
router.get("/reports/all", getAllReports);
router.get("/reports/single/:reportId", getSingleReport);
router.get("/reports/:patientId", getPatientReports);
router.put("/reports/:reportId", upload.single("file"), editReport);
router.get("/profile", getHospitalProfile);
router.put("/profile", updateHospitalProfile);
router.post("/avatar", uploadAvatar.single("avatar"), uploadHospitalAvatar);
router.post("/register/hospital", uploadAvatar.single("avatar"), registerHospital);

export default router;