import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function PATCH(req: NextRequest) {
  try {
    const { id, status, uid, userAppointmentId } = await req.json();

    if (!id || !status) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // 🔥 Update global appointment
    await adminDb.collection("appointments").doc(id).update({
      status,
    });

    // 🔥 ALSO update user appointment
    if (uid && userAppointmentId) {
      await adminDb
        .collection("users")
        .doc(uid)
        .collection("appointments")
        .doc(userAppointmentId)
        .update({ status });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}