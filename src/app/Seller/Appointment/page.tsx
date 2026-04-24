'use client'

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

type Appointment = {
  id: string;
  name: string;
  email: string;
  doctorId: string;
  date: string;
  status: string;
  uid?: string;
  userAppointmentId?: string;
};

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch Appointments
  const fetchAppointments = async () => {
    try {
      const snapshot = await getDocs(collection(db, "appointments"));

      const data: Appointment[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<Appointment, "id">),
      }));

      setAppointments(data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // ✅ FIXED updateStatus
  const updateStatus = async (app: Appointment, status: string) => {
    try {
      await fetch("/api/admin/appointment", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: app.id,
          status,
          uid: app.uid,
          userAppointmentId: app.userAppointmentId,
        }),
      });

      // Refresh after update
      fetchAppointments();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // ⏳ Loading State
  if (loading) {
    return (
      <div className="p-10 text-center text-gray-600">
        Loading appointments...
      </div>
    );
  }

  // ❌ Empty State
  if (appointments.length === 0) {
    return (
      <div className="p-10 text-center text-gray-500">
        No appointments found.
      </div>
    );
  }

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-6">Admin Appointments</h1>

      {appointments.map((app) => (
        <div
          key={app.id}
          className="border p-4 mb-4 rounded-lg shadow bg-white"
        >
          <p><strong>Name:</strong> {app.name}</p>
          <p><strong>Email:</strong> {app.email}</p>
          <p><strong>Date:</strong> {app.date}</p>

          <p>
            <strong>Status:</strong>
            <span
              className={`ml-2 font-semibold ${
                app.status === "pending"
                  ? "text-yellow-500"
                  : app.status === "accepted"
                  ? "text-green-600"
                  : "text-red-500"
              }`}
            >
              {app.status}
            </span>
          </p>

          <div className="mt-3 flex gap-3">
            <button
              onClick={() => updateStatus(app, "accepted")} // ✅ FIXED
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded"
            >
              Accept
            </button>

            <button
              onClick={() => updateStatus(app, "rejected")} // ✅ FIXED
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded"
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}