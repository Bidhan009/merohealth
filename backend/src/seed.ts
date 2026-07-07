import dotenv from "dotenv";
dotenv.config();

import { PrismaClient } from "./generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "./utils/password";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL as string });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding demo data...");

  // Clean existing data
  await prisma.report.deleteMany();
  await prisma.hospitalPatientLink.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.hospital.deleteMany();
  await prisma.user.deleteMany();

  const pw = await hashPassword("demo1234");

  // Hospital 1
  const h1User = await prisma.user.create({
    data: {
      email: "citycare@demo.com",
      password: pw,
      role: "HOSPITAL",
      status: "ACTIVE",
      hospital: {
        create: {
          name: "City Care Hospital",
          registrationNumber: "HSP-DEMO-001",
          address: "Kathmandu, Bagmati Province",
        },
      },
    },
    include: { hospital: true },
  });

  // Hospital 2
  const h2User = await prisma.user.create({
    data: {
      email: "valleyclinic@demo.com",
      password: pw,
      role: "HOSPITAL",
      status: "ACTIVE",
      hospital: {
        create: {
          name: "Valley Clinic",
          registrationNumber: "HSP-DEMO-002",
          address: "Lalitpur, Bagmati Province",
        },
      },
    },
    include: { hospital: true },
  });

  // Patient 1 (adult)
  const p1User = await prisma.user.create({
    data: {
      email: "ram@demo.com",
      password: pw,
      role: "PATIENT",
      status: "ACTIVE",
      patient: {
        create: {
          fullName: "Ram Sharma",
          citizenId: "DEMO-CIT-001",
          isMinor: false,
          dateOfBirth: new Date("1990-05-15"),
        },
      },
    },
    include: { patient: true },
  });

  // Patient 2 (minor)
  const p2User = await prisma.user.create({
    data: {
      email: "sita.guardian@demo.com",
      password: pw,
      role: "PATIENT",
      status: "ACTIVE",
      patient: {
        create: {
          fullName: "Sita Thapa",
          citizenId: "MINOR-DEMO01",
          isMinor: true,
          dateOfBirth: new Date("2013-03-10"),
        },
      },
    },
    include: { patient: true },
  });

  const hospital1 = h1User.hospital!;
  const hospital2 = h2User.hospital!;
  const patient1 = p1User.patient!;
  const patient2 = p2User.patient!;

  // Link both hospitals to patient 1
  await prisma.hospitalPatientLink.create({
    data: { hospitalId: hospital1.id, patientId: patient1.id },
  });
  await prisma.hospitalPatientLink.create({
    data: { hospitalId: hospital2.id, patientId: patient1.id },
  });

  // Link hospital 1 to patient 2
  await prisma.hospitalPatientLink.create({
    data: { hospitalId: hospital1.id, patientId: patient2.id },
  });

  // Reports
  await prisma.report.createMany({
    data: [
      {
        title: "Blood Test Results",
        description: "Full CBC panel — all values within normal range.",
        fileUrl: "",
        patientId: patient1.id,
        hospitalId: hospital1.id,
      },
      {
        title: "X-Ray Report",
        description: "Chest X-ray — no abnormalities detected.",
        fileUrl: "",
        patientId: patient1.id,
        hospitalId: hospital2.id,
      },
      {
        title: "Vaccination Record",
        description: "Hepatitis B booster administered.",
        fileUrl: "",
        patientId: patient2.id,
        hospitalId: hospital1.id,
      },
    ],
  });

  console.log("✅ Seed complete!");
  console.log("Demo accounts (password: demo1234):");
  console.log("  Hospital 1: citycare@demo.com");
  console.log("  Hospital 2: valleyclinic@demo.com");
  console.log("  Patient 1:  ram@demo.com");
  console.log("  Patient 2:  sita.guardian@demo.com");

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});