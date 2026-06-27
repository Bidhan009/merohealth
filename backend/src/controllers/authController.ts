import { Request, Response } from "express";
import { z } from "zod";
import prisma from "../utils/prisma";
import { hashPassword } from "../utils/password";

const hospitalRegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  registrationNumber: z.string().min(3),
  address: z.string().min(5),
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

    const newUser = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        role: "HOSPITAL",
        status: "PENDING_VERIFICATION",
        hospital: {
          create: {
            name: data.name,
            registrationNumber: data.registrationNumber,
            address: data.address,
          },
        },
      },
    });

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