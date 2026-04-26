import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { ConvexHttpClient } from "convex/browser";
import { api } from "convex/_generated/api";

// ✅ Required to use Node features
export const runtime = "nodejs";

interface AppointmentRequest {
  uid: string;
  name: string;
  email: string;
  date: string; // YYYY-MM-DD
  doctor: string;
  doctorId: string;
  pwd?: boolean;
  message?: string;
}

// Convert YYYY-MM-DD to Date safely
function dateFromYMDLocal(ymd: string): Date {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

function badRequest(msg: string) {
  return NextResponse.json({ error: msg }, { status: 400 });
}

export async function POST(request: NextRequest) {
  try {
    const { uid, name, email, date, doctor, doctorId, message, pwd }: AppointmentRequest =
      await request.json();

    if (!uid || !name || !email || !date || !doctor || !doctorId) {
      return badRequest("Missing required fields");
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return badRequest("Invalid date format; expected YYYY-MM-DD");
    }

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return NextResponse.json(
        { error: "SMTP credentials not configured" },
        { status: 500 }
      );
    }

    // =========================
    // 🔥 FETCH DOCTOR FROM CONVEX
    // =========================
    const convex = new ConvexHttpClient(
      process.env.NEXT_PUBLIC_CONVEX_URL!
    );

    const doctorData = await convex.query(api.doctors.getDoctorById, {
      id: doctorId as any,
    });

    const doctorEmail = doctorData?.email;
    const doctorName = doctorData?.name;

    if (!doctorEmail) {
      return badRequest("Doctor email not found");
    }

    // =========================
    // STORE APPOINTMENT
    // =========================
    const whenLocal = dateFromYMDLocal(date);

    const docRef = await adminDb
      .collection("users")
      .doc(uid)
      .collection("appointments")
      .add({
        name,
        email,
        doctor,
        doctorId,
        message: message ?? "",
        pwd: pwd ?? false,
        date: Timestamp.fromDate(whenLocal),
        canceled: false,
        status: "pending",
        createdAt: FieldValue.serverTimestamp(),
      });

    // =========================
    // MAIL TRANSPORTER
    // =========================
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const baseUrl =
      request.headers.get("origin") ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    const acceptUrl = `${baseUrl}/api/appointment/respond?id=${docRef.id}&uid=${uid}&action=accept`;
    const declineUrl = `${baseUrl}/api/appointment/respond?id=${docRef.id}&uid=${uid}&action=decline`;

    // =========================
    // 🧑‍⚕️ DOCTOR EMAIL (MAIN)
    // =========================
    await transporter.sendMail({
      from: `"Quick Heal" <${process.env.SMTP_USER}>`,

      to: doctorEmail, // 👈 dynamic doctor email

      cc: "souravsahoo72051@gmail.com", // admin copy

      replyTo: doctorEmail,

      subject: `New Appointment Request - ${doctorName}`,

      html: `
        <div style="font-family: Arial; padding: 20px;">
          <h2>🏥 New Appointment Request</h2>

          <p><strong>Patient:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Doctor:</strong> ${doctorName}</p>
          <p><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</p>

          ${pwd ? `<p>🏠 Home visit required</p>` : ""}
          ${message ? `<p><strong>Message:</strong> ${message}</p>` : ""}

          <div style="margin-top:20px;">
            <a href="${acceptUrl}" style="background:green;color:white;padding:10px 15px;border-radius:6px;text-decoration:none;margin-right:10px;">
              ✅ Accept
            </a>

            <a href="${declineUrl}" style="background:red;color:white;padding:10px 15px;border-radius:6px;text-decoration:none;">
              ❌ Decline
            </a>
          </div>
        </div>
      `,
    });

    // =========================
    // 👤 PATIENT CONFIRMATION
    // =========================
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: "Appointment Request Confirmation ✅",
      html: `
        <div style="font-family: Arial; padding: 20px;">
          <h2>✅ Appointment Received</h2>

          <p>Hello <b>${name}</b>,</p>
          <p>Your appointment with <b>${doctorName}</b> is received.</p>
          <p><b>Date:</b> ${new Date(date).toLocaleDateString()}</p>

          ${pwd ? `<p>🏠 Doctor will contact you for home visit.</p>` : ""}
          ${message ? `<p>${message}</p>` : ""}

          <p>We will confirm within 24 hours.</p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      id: docRef.id,
      message: "Appointment created and emails sent",
    });

  } catch (error) {
    console.error("❌ API error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// Health check
export async function GET() {
  return NextResponse.json({
    message: "Doctor Appointments API is running 🏥",
    status: "ok",
    timestamp: new Date().toISOString(),
  });
}