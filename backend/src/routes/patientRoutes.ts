import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/authMiddleware";
import { getMyRecords,changePassword } from "../controllers/patientController";

const router = Router();

router.use(requireAuth);
router.use(requireRole("PATIENT"));

router.get("/me", getMyRecords);
router.put("/change-password", changePassword);

export default router;