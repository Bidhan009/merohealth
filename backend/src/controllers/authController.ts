import { generateMinorId, calculateAge } from "../utils/idGenerator";
import { Request, Response } from "express";
import { z } from "zod";
import prisma from "../utils/prisma";
import { comparePassword, hashPassword } from "../utils/password";
import { generateVerificationToken } from "../utils/idGenerator";
import { sendVerificationEmail } from "../utils/mailer";
import { generateToken } from "../utils/jwt";

const hospitalRegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  registrationNumber: z.string().min(3),
  address: z.string().min(5),
});

const patientRegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2),
  dateOfBirth: z.coerce.date(),
  citizenId: z.string().min(3).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function registerHospital(req: Request, res: Response) {
  try {
    const data = hospitalRegisterSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const hashedPassword = await hashPassword(data.password);

    const verificationToken = generateVerificationToken();

    const newUser = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        role: "HOSPITAL",
        status: "PENDING_VERIFICATION",
        verificationToken: verificationToken,
        hospital: {
          create: {
            name: data.name,
            registrationNumber: data.registrationNumber,
            address: data.address,
          },
        },
      },
    });
    await sendVerificationEmail(data.email, "HOSPITAL", data.name, verificationToken);

    return res.status(201).json({
      message: "Hospital registered. Awaiting admin verification.",
      userId: newUser.id,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    console.error(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
}

export async function registerPatient(req: Request, res: Response) {
  try {
    const data = patientRegisterSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const age = calculateAge(data.dateOfBirth);
    const isMinor = age < 16;

    if (!isMinor && !data.citizenId) {
      return res.status(400).json({ error: "Citizen ID is required for non-minors" });
    }

    const finalCitizenId = isMinor ? generateMinorId() : data.citizenId!;

    const hashedPassword = await hashPassword(data.password);

    const verificationToken = generateVerificationToken();
    const newUser = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        role: "PATIENT",
        status: "PENDING_VERIFICATION",
        verificationToken: verificationToken,
        patient: {
          create: {
            fullName: data.fullName,
            dateOfBirth: data.dateOfBirth,
            citizenId: finalCitizenId,
            isMinor: isMinor,
          },
        },
      },
    });
    await sendVerificationEmail(data.email, "PATIENT", data.fullName, verificationToken);

    return res.status(201).json({
      message: "Patient registered. Awaiting admin verification.",
      userId: newUser.id,
      citizenId: finalCitizenId,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    console.error(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
}

export async function approveUser(req: Request, res: Response) {
  try {
    const token = req.params.token as string;

    const user = await prisma.user.findUnique({
      where: { verificationToken: token },
    });

    if (!user) {
      return res.status(404).send("Invalid or already-used verification link.");
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { status: "ACTIVE", verificationToken: null },
    });

    return res.send(`<h2>Approved</h2><p>${user.email} has been activated.</p>`);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Something went wrong.");
  }
}

export async function rejectUser(req: Request, res: Response) {
  try {
    const token = req.params.token as string;

    const user = await prisma.user.findUnique({
      where: { verificationToken: token },
    });

    if (!user) {
      return res.status(404).send("Invalid or already-used verification link.");
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { status: "REJECTED", verificationToken: null },
    });

    return res.send(`<h2>Rejected</h2><p>${user.email} has been rejected.</p>`);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Something went wrong.");
  }
}

export async function login(req: Request, res: Response) {
  try {
    const data = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user || !user.password) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isMatch = await comparePassword(data.password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    if (user.status === "PENDING_VERIFICATION") {
      return res.status(403).json({ error: "Your account is still awaiting admin verification" });
    }

    if (user.status === "REJECTED") {
      return res.status(403).json({ error: "Your registration was rejected" });
    }

    const token = generateToken({ userId: user.id, role: user.role });

    return res.json({
      message: "Login successful",
      token,
      role: user.role,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    console.error(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
}