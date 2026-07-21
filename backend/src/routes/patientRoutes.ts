import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/authMiddleware";
import {
  getMyRecords,
  changePassword,
  uploadPatientAvatar,
} from "../controllers/patientController";
import { uploadAvatar } from "../utils/upload";

const router = Router();

router.use(requireAuth);
router.use(requireRole("PATIENT"));

router.get("/me", getMyRecords);
router.put("/change-password", changePassword);
router.post("/avatar", uploadAvatar.single("avatar"), uploadPatientAvatar);

export default router;