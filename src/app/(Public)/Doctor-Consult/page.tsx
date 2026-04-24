"use client";
import {  useQuery } from "convex/react"; // 🔥 ADD useQuery
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { useEffect, useState, useMemo, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  Mail,
  User2,
  Stethoscope,
  Trash2,
  XCircle,
  Loader2,
} from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, app } from "@/lib/firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
  getFirestore,
  Timestamp,
} from "firebase/firestore";

type Appointment = {
  id: string;
  name: string;
  email: string;
  doctor: string;
  doctorId: string;  
  date: Timestamp;
  message?: string;
  canceled?: boolean;
};

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function DoctorConsultPage() {
  const [uid, setUid] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
  name: "",
  email: "",
  doctor: "",
  doctorId: "",   // ✅ ADD THIS
  date: "",
  message: "",
});

  const db = getFirestore(app);
const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
const [rating, setRating] = useState(0);
const [review, setReview] = useState("");
const rateDoctor = useMutation(api.doctors.rateDoctor);
const doctors = useQuery(api.doctors.getDoctors) || []; // 🔥 ADD HERE
const openRatingModal = (appointment: any) => {
  setSelectedDoctor({
    doctorId: appointment.doctorId, // must exist
    doctor: appointment.doctor,
  });
};



const submitRating = async () => {
  if (!uid || !selectedDoctor) return;

  try {
 await rateDoctor({
  doctorId: selectedDoctor.doctorId, 
  userId: uid!,
  rating,
  review,
});

    alert("Rating submitted ✅");
    setSelectedDoctor(null);
    setRating(0);
    setReview("");
  } catch (err) {
    console.error(err);
  }
};


  // Track logged-in user
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUid(u?.uid ?? null));
    return () => unsub();
  }, []);

  // Fetch appointments
  useEffect(() => {
    if (!uid) {
      setAppointments([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, `users/${uid}/appointments`),
      orderBy("date", "asc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({
        ...(d.data() as Appointment),
        id: d.id,
      }));
      setAppointments(data);
      setLoading(false);
    });

    return () => unsub();
  }, [uid, db]);

  // Cancel appointment
  const handleCancel = async (a: Appointment) => {
    if (!uid) return;
    await updateDoc(doc(db, `users/${uid}/appointments/${a.id}`), {
      canceled: true,
    });
  };

  // Delete appointment
  const handleDelete = async (a: Appointment) => {
    if (!uid) return;
    await deleteDoc(doc(db, `users/${uid}/appointments/${a.id}`));
  };

  // Appointment status
  const statusOf = (a: Appointment) => {
    const t = startOfToday().getTime();
    const d = a.date.toDate();
    d.setHours(0, 0, 0, 0);
    if (a.canceled) return "Canceled";
    if (d.getTime() < t) return "Past";
    return "Upcoming";
  };

  const sortedAppointments = useMemo(
    () => appointments.sort((a, b) => a.date.toMillis() - b.date.toMillis()),
    [appointments]
  );

  // Handle form submit
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!uid) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/appointment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, ...formData }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit");

      alert("Appointment requested successfully ✅");
     setFormData({ name: "", email: "", doctor: "", doctorId: "", date: "", message: "" });
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!uid) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-gray-600">Please log in to view your appointments.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin w-6 h-6 text-gray-500" />
      </div>
    );
  }

  return (
    <section className="w-full py-10 px-6 lg:px-12">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8 flex items-center gap-3">
          <Stethoscope className="text-teal-600" />
          <h1 className="text-2xl font-semibold">Doctor Consult</h1>
        </header>

        {/* ✅ Appointment Form */}
        <form
          className="mb-10 rounded-xl border bg-white p-6 shadow-sm space-y-4"
          onSubmit={handleSubmit}
        >
          <h2 className="text-lg font-semibold mb-2">Request a New Appointment</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Your Name"
              value={formData.name}
              required
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="border rounded px-3 py-2 w-full"
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              required
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="border rounded px-3 py-2 w-full"
            />
          <select
  required
  className="border rounded px-3 py-2 w-full"
 onChange={(e) => {
  if (!e.target.value) return; // ✅ IMPORTANT FIX

  const selected = JSON.parse(e.target.value);

  setFormData({
    ...formData,
    doctor: selected.name,
    doctorId: selected._id,
  });
}}
>
  <option value="">Select Doctor</option>

  {doctors.map((doc) => (
    <option key={doc._id} value={JSON.stringify(doc)}>
      {doc.name}
    </option>
  ))}
</select>
            <input
              type="date"
              placeholder="Appointment Date"
              value={formData.date}
              required
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="border rounded px-3 py-2 w-full"
            />
          </div>
          <textarea
            placeholder="Message / Concern (optional)"
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="border rounded px-3 py-2 w-full"
          />
          <Button type="submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Request Appointment"}
          </Button>
        </form>

        {/* ✅ Existing Appointments */}
        {sortedAppointments.map((a) => {
  const status = statusOf(a);   // ✅ FIRST declare
  const dStr = a.date.toDate().toLocaleDateString();

  return (
    <div
      key={a.id}
      className="rounded-xl border bg-white p-5 shadow-sm"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-gray-800">
            <User2 className="w-4 h-4 text-gray-500" />
            <span className="font-medium">{a.name}</span>
          </div>

          <div className="flex items-center gap-2 text-gray-600">
            <Mail className="w-4 h-4 text-gray-500" />
            <span className="text-sm">{a.email}</span>
          </div>

          <div className="flex items-center gap-2 text-gray-700">
            <Stethoscope className="w-4 h-4 text-gray-500" />
            <span className="text-sm">{a.doctor}</span>
          </div>

          <div className="flex items-center gap-2 text-gray-700">
            <CalendarDays className="w-4 h-4 text-gray-500" />
            <span className="text-sm">{dStr}</span>
          </div>

          {a.message && (
            <p className="text-sm text-gray-600 mt-2">{a.message}</p>
          )}

          {/* ✅ ⭐ RATE BUTTON HERE */}
          {status === "Upcoming"  && (
            <div className="mt-3">
              <Button
                size="sm"
                onClick={() => openRatingModal(a)}
                className="bg-yellow-500 hover:bg-yellow-600 text-white"
              >
                ⭐ Rate Doctor
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              status === "Upcoming"
                ? "bg-emerald-50 text-emerald-700"
                : status === "Canceled"
                ? "bg-yellow-50 text-yellow-700"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {status}
          </span>

          <div className="flex items-center gap-2">
            {!a.canceled && (
              <Button
                variant="secondary"
                className="gap-2"
                onClick={() => handleCancel(a)}
              >
                <XCircle className="w-4 h-4" />
                Cancel
              </Button>
            )}

            <Button
              variant="destructive"
              className="gap-2"
              onClick={() => handleDelete(a)}
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
})}
      </div>
      {selectedDoctor && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-xl w-[400px]">
      <h2 className="text-lg font-semibold mb-4">
       Rate {selectedDoctor.doctor}
      </h2>

      {/* ⭐ Stars */}
      <div className="flex gap-2 mb-4">
        {[1,2,3,4,5].map((star) => (
          <span
            key={star}
            onClick={() => setRating(star)}
            className={`cursor-pointer text-2xl ${
              star <= rating ? "text-yellow-500" : "text-gray-300"
            }`}
          >
            ★
          </span>
        ))}
      </div>

      {/* Review */}
      <textarea
        placeholder="Write review..."
        value={review}
        onChange={(e) => setReview(e.target.value)}
        className="w-full border p-2 rounded mb-4"
      />

      {/* Buttons */}
      <div className="flex justify-end gap-2">
        <Button
          variant="secondary"
          onClick={() => setSelectedDoctor(null)}
        >
          Cancel
        </Button>

        <Button
  onClick={async () => {
    try {
   await rateDoctor({
  doctorId: selectedDoctor.doctorId,
  userId: uid!,
  rating,
  review,
});

      alert("Rating submitted ✅");
    } catch (err) {
      console.error(err);
    }

    setSelectedDoctor(null);
    setRating(0);
    setReview("");
  }}
>
          Submit
        </Button>
      </div>
    </div>
  </div>
)}
    </section>







  );




  
}
