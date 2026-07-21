import { Response } from "express";
import prisma from "../utils/prisma";
import { AuthRequest } from "../middleware/authMiddleware";
import { comparePassword, hashPassword } from "../utils/password";

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

    const userEmail = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { email: true },
    });

  return res.json({ patient, reports, email: userEmail?.email });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
}

export async function changePassword(req: AuthRequest, res: Response) {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Both passwords required" });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
    });

    if (!user || !user.password) {
      return res.status(404).json({ error: "User not found" });
    }

    const isMatch = await comparePassword(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    const hashed = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed },
    });

    return res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
}
export async function uploadPatientAvatar(req: AuthRequest, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const patient = await prisma.patient.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    await prisma.patient.update({
      where: { id: patient.id },
      data: { avatarUrl },
    });
    return res.json({ avatarUrl });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
}