import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

export async function GET() {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Senta Test" <${process.env.EMAIL_USER}>`,
    to: "luster42443@gmail.com",
    subject: "✅ Senta Email Test",
    text: "If you got this, email works perfectly.",
  });

  return NextResponse.json({ ok: true });
}
