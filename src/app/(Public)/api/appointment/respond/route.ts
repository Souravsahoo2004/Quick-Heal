import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import nodemailer from "nodemailer";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const id = searchParams.get("id");
  const uid = searchParams.get("uid");
  const action = searchParams.get("action"); // accept | decline

  if (!id || !uid || !action) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const docRef = adminDb
    .collection("users")
    .doc(uid)
    .collection("appointments")
    .doc(id);

  const docSnap = await docRef.get();

  if (!docSnap.exists) {
    return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
  }

  const data = docSnap.data();

  const newStatus = action === "accept" ? "accepted" : "declined";

  // ✅ Update status
  await docRef.update({
    status: newStatus,
  });

  // ✅ Send mail to user
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: data?.email,
    subject: `Appointment ${newStatus.toUpperCase()}`,
    html: `
      <h2>Appointment ${newStatus.toUpperCase()}</h2>
      <p>Hello ${data?.name},</p>
      <p>Your appointment with <b>${data?.doctor}</b> has been 
      <b style="color:${newStatus === "accepted" ? "green" : "red"}">
      ${newStatus}
      </b>.</p>
    `,
  });

  // ✅ FIXED BASE URL
  const origin = req.headers.get("origin");

  const baseUrl =
    origin ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";

  const redirectUrl = `${baseUrl}/my-appointments?status=${newStatus}`;

  return NextResponse.redirect(new URL(redirectUrl));
}