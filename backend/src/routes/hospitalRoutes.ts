import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/authMiddleware";
import { searchPatient, linkPatient, getLinkedPatients } from "../controllers/hospitalController";
import { createReport, getPatientReports, editReport, getSingleReport } from "../controllers/reportController";
import { upload } from "../utils/upload";

const router = Router();

router.use(requireAuth);
router.use(requireRole("HOSPITAL"));

router.get("/patients/search", searchPatient);
router.get("/patients", getLinkedPatients);
router.post("/patients/link", linkPatient);

router.post("/reports", upload.single("file"), createReport);
router.get("/reports/single/:reportId", getSingleReport);
router.get("/reports/:patientId", getPatientReports);
router.put("/reports/:reportId", upload.single("file"), editReport);


export default router;