import { Response } from "express";
import { z } from "zod";
import prisma from "../utils/prisma";
import { AuthRequest } from "../middleware/authMiddleware";

const reportSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  patientId: z.string(),
});

export async function createReport(req: AuthRequest, res: Response) {
  try {
    const data = reportSchema.parse(req.body);

    const hospital = await prisma.hospital.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!hospital) {
      return res.status(404).json({ error: "Hospital not found" });
    }

    // Check hospital is linked to this patient
    const link = await prisma.hospitalPatientLink.findUnique({
      where: {
        patientId_hospitalId: {
          patientId: data.patientId,
          hospitalId: hospital.id,
        },
      },
    });

    if (!link) {
      return res.status(403).json({ error: "Patient not linked to your hospital" });
    }

    const fileUrl = req.file
      ? `/uploads/reports/${req.file.filename}`
      : "";

    const report = await prisma.report.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        fileUrl,
        patientId: data.patientId,
        hospitalId: hospital.id,
      },
    });

    return res.status(201).json(report);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    console.error(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
}

export async function getPatientReports(req: AuthRequest, res: Response) {
  try {
    const patientId = req.params.patientId as string;

    const hospital = await prisma.hospital.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!hospital) {
      return res.status(404).json({ error: "Hospital not found" });
    }

    // Must be linked to view
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

    const reports = await prisma.report.findMany({
      where: { patientId },
      include: { hospital: { select: { name: true, id: true } } },
      orderBy: { createdAt: "desc" },
    });

    // Flag which reports belong to this hospital
    const enriched = reports.map((r) => ({
      ...r,
      isOwn: r.hospitalId === hospital.id,
    }));

    return res.json(enriched);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
}

export async function editReport(req: AuthRequest, res: Response) {
  try {
    const reportId = req.params.reportId as string;

    const hospital = await prisma.hospital.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!hospital) {
      return res.status(404).json({ error: "Hospital not found" });
    }

    const report = await prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }

    // Ownership check — the critical permission rule
    if (report.hospitalId !== hospital.id) {
      return res.status(403).json({ error: "Cannot edit another hospital's report" });
    }

    const updated = await prisma.report.update({
      where: { id: reportId },
      data: {
        title: (req.body.title as string | undefined) ?? report.title,
        description: (req.body.description as string | undefined) ?? report.description,
        fileUrl: req.file
          ? `/uploads/reports/${req.file.filename}`
          : report.fileUrl,
      },
    });

    return res.json(updated);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
}

export async function getSingleReport(req: AuthRequest, res: Response) {
  try {
    const reportId = req.params.reportId as string;

    const hospital = await prisma.hospital.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!hospital) {
      return res.status(404).json({ error: "Hospital not found" });
    }

    const report = await prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }

    if (report.hospitalId !== hospital.id) {
      return res.status(403).json({ error: "Cannot access another hospital's report" });
    }

    return res.json(report);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
}

export async function getAllReports(req: AuthRequest, res: Response) {
  try {
    const hospital = await prisma.hospital.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!hospital) {
      return res.status(404).json({ error: "Hospital not found" });
    }

    // Get all patients linked to this hospital
    const links = await prisma.hospitalPatientLink.findMany({
      where: { hospitalId: hospital.id },
      select: { patientId: true },
    });

    const patientIds = links.map((l) => l.patientId);

    // Get all reports for those patients
    const reports = await prisma.report.findMany({
      where: { patientId: { in: patientIds } },
      include: {
        hospital: { select: { name: true, id: true } },
        patient: { select: { fullName: true, citizenId: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const enriched = reports.map((r) => ({
      ...r,
      isOwn: r.hospitalId === hospital.id,
    }));

    return res.json(enriched);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
}