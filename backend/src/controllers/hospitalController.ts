import { Response } from "express";
import { z } from "zod";
import prisma from "../utils/prisma";
import { AuthRequest } from "../middleware/authMiddleware";

// Search patient by citizen ID
export async function searchPatient(req: AuthRequest, res: Response) {
  try {
    const { citizenId } = req.query;

    if (!citizenId || typeof citizenId !== "string") {
      return res.status(400).json({ error: "citizenId query param required" });
    }

    const patient = await prisma.patient.findUnique({
      where: { citizenId },
      select: {
        id: true,
        fullName: true,
        citizenId: true,
        isMinor: true,
        dateOfBirth: true,
        avatarUrl: true,
        bloodType: true,
        allergies: true,
        chronicConditions: true,
        medications: true,
        emergencyName: true,
        emergencyPhone: true,
        emergencyRelation: true,
        organDonor: true,
        user: { select: { email: true, status: true } },
      },
    });

    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    if (patient.user.status !== "ACTIVE") {
      return res.status(403).json({ error: "Patient account is not yet active" });
    }

    const hospital = await prisma.hospital.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!hospital) {
      return res.status(404).json({ error: "Hospital not found" });
    }

    const [link, reportCount, lastReport] = await Promise.all([
      prisma.hospitalPatientLink.findUnique({
        where: {
          patientId_hospitalId: {
            patientId: patient.id,
            hospitalId: hospital.id,
          },
        },
      }),
      prisma.report.count({ where: { patientId: patient.id } }),
      prisma.report.findFirst({
        where: { patientId: patient.id },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      }),
    ]);

    return res.json({
      ...patient,
      isLinked: !!link,
      reportCount,
      lastReportDate: lastReport?.createdAt ?? null,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
}

// Link patient to hospital
export async function linkPatient(req: AuthRequest, res: Response) {
  try {
    const { patientId } = req.body;

    if (!patientId) {
      return res.status(400).json({ error: "patientId required" });
    }

    const hospital = await prisma.hospital.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!hospital) {
      return res.status(404).json({ error: "Hospital not found" });
    }

    const existing = await prisma.hospitalPatientLink.findUnique({
      where: {
        patientId_hospitalId: {
          patientId,
          hospitalId: hospital.id,
        },
      },
    });

    if (existing) {
      return res.status(409).json({ error: "Patient already linked" });
    }

    const link = await prisma.hospitalPatientLink.create({
      data: { patientId, hospitalId: hospital.id },
    });

    return res.status(201).json({ message: "Patient linked successfully", link });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
}

// Get all patients linked to this hospital
export async function getLinkedPatients(req: AuthRequest, res: Response) {
  try {
    const hospital = await prisma.hospital.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!hospital) {
      return res.status(404).json({ error: "Hospital not found" });
    }

    const links = await prisma.hospitalPatientLink.findMany({
      where: { hospitalId: hospital.id },
      orderBy: { linkedAt: "desc" },
      include: {
        patient: {
        select: {
          id: true,
          fullName: true,
          citizenId: true,
          isMinor: true,
          dateOfBirth: true,
          avatarUrl: true,
          bloodType: true,
          user: { select: { email: true } },
        },
      },
      },
    });

    const patientIds = links.map((l) => l.patientId);

    // Batch report stats for all linked patients in a single query
    const reportStats = await prisma.report.groupBy({
      by: ["patientId"],
      where: { patientId: { in: patientIds } },
      _count: { _all: true },
      _max: { createdAt: true },
    });

    const statsByPatientId = new Map(
      reportStats.map((s) => [s.patientId, { reportCount: s._count._all, lastReportDate: s._max.createdAt }])
    );

    const patients = links.map((l) => ({
      ...l.patient,
      reportCount: statsByPatientId.get(l.patientId)?.reportCount ?? 0,
      lastReportDate: statsByPatientId.get(l.patientId)?.lastReportDate ?? null,
    }));

    return res.json(patients);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
}

// Read-only emergency info for a linked patient
export async function getPatientEmergencyInfo(req: AuthRequest, res: Response) {
  try {
    const patientId = req.params.patientId as string;

    const hospital = await prisma.hospital.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!hospital) {
      return res.status(404).json({ error: "Hospital not found" });
    }

    const link = await prisma.hospitalPatientLink.findUnique({
      where: {
        patientId_hospitalId: {
          patientId,
          hospitalId: hospital.id,
        },
      },
    });

    if (!link) {
      return res.status(403).json({ error: "Not authorized to view this patient" });
    }

    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
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

export async function getHospitalProfile(req: AuthRequest, res: Response) {
  try {
    const hospital = await prisma.hospital.findUnique({
      where: { userId: req.user!.userId },
      include: { user: { select: { email: true } } },
    });
    if (!hospital) return res.status(404).json({ error: "Hospital not found" });
    return res.json(hospital);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
}

export async function updateHospitalProfile(req: AuthRequest, res: Response) {
  try {
    const { name, address } = req.body;
    const hospital = await prisma.hospital.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!hospital) return res.status(404).json({ error: "Hospital not found" });
    const updated = await prisma.hospital.update({
      where: { id: hospital.id },
      data: {
        ...(name && { name }),
        ...(address && { address }),
      },
    });
    return res.json(updated);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
}

export async function uploadHospitalAvatar(req: AuthRequest, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const hospital = await prisma.hospital.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!hospital) {
      return res.status(404).json({ error: "Hospital not found" });
    }
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    await prisma.hospital.update({
      where: { id: hospital.id },
      data: { avatarUrl },
    });
    return res.json({ avatarUrl });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
}
