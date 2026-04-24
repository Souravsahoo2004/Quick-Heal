import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";

// ✅ Required to use Node features (Nodemailer/Firebase Admin)
export const runtime = "nodejs";

interface AppointmentRequest {
  uid: string;
  name: string;
  email: string;
  date: string; // 'YYYY-MM-DD'
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
    if (!uid || !name || !email || !date || !doctor) {
      return badRequest(
        "Missing required fields: uid, name, email, date, doctor"
      );
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

    // Store appointment in Firestore
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

    // Nodemailer
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


    // Admin email
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: "souravsahoo72051@gmail.com",
      subject: `New Doctor Appointment Request - ${name}`,
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #0891b2, #06b6d4); padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white;">🏥 New Appointment Request</h1>
        </div>
        <div style="background: white; padding: 20px; border: 1px solid #e5e7eb;">
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</p>
          <p><strong>Doctor:</strong> ${doctor}</p>
          ${pwd ? `<p><strong>🦽 Special Request:</strong> Patient requires home visit (PWD)</p>` : ""}
          ${message ? `<p><strong>Message:</strong> ${message}</p>` : ""}
        </div>

<p><strong>Doctor:</strong> ${doctor}</p>

<div style="margin-top:20px;">
  <a href="${acceptUrl}" 
     style="background:green;color:white;padding:10px 15px;border-radius:6px;text-decoration:none;margin-right:10px;">
     ✅ Accept
  </a>

  <a href="${declineUrl}" 
     style="background:red;color:white;padding:10px 15px;border-radius:6px;text-decoration:none;">
     ❌ Decline
  </a>
</div>

      </div>`,
      
    });

    // Patient confirmation
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: "Appointment Request Confirmation ✅",
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white;">✅ Appointment Request Received</h1>
        </div>
        <div style="background: white; padding: 20px; border: 1px solid #e5e7eb;">
          <p>Hello <b>${name}</b>,</p>
          <p>We have received your appointment request with <b>${doctor}</b>.</p>
          <p><b>Date:</b> ${new Date(date).toLocaleDateString()}</p>
          ${pwd ? `<p style="color: green;"><b>🏠 Note:</b> Doctor will contact you and visit your home.</p>` : ""}
          ${message ? `<p><b>Your Concern:</b> ${message}</p>` : ""}
          <p>Our team will contact you within 24 hours to confirm your appointment.</p>
        </div>
      </div>`,
    });

    return NextResponse.json({
      success: true,
      id: docRef.id,
      appointmentDetails: { name, doctor, date, email },
      message: "Appointment stored and confirmation emails sent successfully.",
    });
  } catch (error) {
    console.error("❌ API error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: `Failed: ${msg}` }, { status: 500 });
  }
}

// Health check
export async function GET() {
  return NextResponse.json({
    message: "Doctor Appointments API is running 🏥",
    status: "operational",
    timestamp: new Date().toISOString(),
  });
}
