import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 465),
  secure: process.env.SMTP_SECURE !== "false",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendMail(
  to: string,
  subject: string,
  html: string
): Promise<void> {
  await transporter.sendMail({
    from: `"syrflow" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
}
