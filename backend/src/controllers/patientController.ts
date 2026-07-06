import { Response } from "express";
import prisma from "../utils/prisma";
import { AuthRequest } from "../middleware/authMiddleware";

export async function getMyRecords(req: AuthRequest, res: Response) {
  try {
    const patient = await prisma.patient.findUnique({
      where: { userId: req.user!.userId },
      select: {
        id: true,
        fullName: true,
        citizenId: true,
        isMinor: true,
        dateOfBirth: true,
      },
    });

    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    const reports = await prisma.report.findMany({
      where: { patientId: patient.id },
      include: { hospital: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ patient, reports });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
}