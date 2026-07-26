import { Response } from "express";
import { z } from "zod";
import prisma from "../utils/prisma";
import { AuthRequest } from "../middleware/authMiddleware";
import { comparePassword, hashPassword } from "../utils/password";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;

const emergencyInfoSchema = z.object({
  bloodType: z.union([z.enum(BLOOD_TYPES), z.literal("")]).optional(),
  allergies: z.string().optional(),
  chronicConditions: z.string().optional(),
  medications: z.string().optional(),
  emergencyName: z.string().optional(),
  emergencyPhone: z.string().optional(),
  emergencyRelation: z.string().optional(),
  organDonor: z.boolean().optional(),
});

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
          avatarUrl: true,
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

export async function getEmergencyInfo(req: AuthRequest, res: Response) {
  try {
    const patient = await prisma.patient.findUnique({
      where: { userId: req.user!.userId },
      select: {
        fullName: true,
        citizenId: true,
        dateOfBirth: true,
        isMinor: true,
        avatarUrl: true,
        bloodType: true,
        allergies: true,
        chronicConditions: true,
        medications: true,
        emergencyName: true,
        emergencyPhone: true,
        emergencyRelation: true,
        organDonor: true,
        emergencyUpdatedAt: true,
      },
    });

    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    return res.json(patient);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
}

export async function updateEmergencyInfo(req: AuthRequest, res: Response) {
  try {
    const data = emergencyInfoSchema.parse(req.body);

    const patient = await prisma.patient.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    const updated = await prisma.patient.update({
      where: { id: patient.id },
      data: {
        ...(data.bloodType !== undefined && { bloodType: data.bloodType }),
        ...(data.allergies !== undefined && { allergies: data.allergies }),
        ...(data.chronicConditions !== undefined && { chronicConditions: data.chronicConditions }),
        ...(data.medications !== undefined && { medications: data.medications }),
        ...(data.emergencyName !== undefined && { emergencyName: data.emergencyName }),
        ...(data.emergencyPhone !== undefined && { emergencyPhone: data.emergencyPhone }),
        ...(data.emergencyRelation !== undefined && { emergencyRelation: data.emergencyRelation }),
        ...(data.organDonor !== undefined && { organDonor: data.organDonor }),
        emergencyUpdatedAt: new Date(),
      },
    });

    return res.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.issues.map((issue) => issue.message).join(", ");
      return res.status(400).json({ error: message });
    }
    console.error(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
}