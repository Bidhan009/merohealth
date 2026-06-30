import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

export async function sendVerificationEmail(
  applicantEmail: string,
  applicantType: "PATIENT" | "HOSPITAL",
  applicantName: string,
  token: string
) {
  const approveUrl = `http://localhost:5000/api/auth/approve/${token}`;
  const rejectUrl = `http://localhost:5000/api/auth/reject/${token}`;

  await transporter.sendMail({
    from: `"MeroHealth System" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `New ${applicantType} Registration: ${applicantName}`,
    html: `
      <h2>New ${applicantType} Registration Request</h2>
      <p><strong>Name:</strong> ${applicantName}</p>
      <p><strong>Email:</strong> ${applicantEmail}</p>
      <p>
        <a href="${approveUrl}" style="background:green;color:white;padding:10px 20px;text-decoration:none;">Approve</a>
        &nbsp;
        <a href="${rejectUrl}" style="background:red;color:white;padding:10px 20px;text-decoration:none;">Reject</a>
      </p>
    `,
  });
}