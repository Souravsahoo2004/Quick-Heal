"use client";

import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function AppointmentStatusClient() {
  const params = useSearchParams();
  const status = params.get("status");

  const isAccepted = status === "accepted";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 to-teal-100 p-6">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center">
        
        {/* Icon */}
        <div className="text-6xl mb-4">
          {isAccepted ? "✅" : "❌"}
        </div>

        {/* Title */}
        <h1
          className={`text-2xl font-bold mb-3 ${
            isAccepted ? "text-green-600" : "text-red-600"
          }`}
        >
          {isAccepted
            ? "Appointment Accepted"
            : "Appointment Declined"}
        </h1>

        {/* Message */}
        <p className="text-gray-600 mb-6">
          {isAccepted
            ? "The doctor has accepted this appointment. The patient will be notified."
            : "The doctor has declined this appointment. The patient will be notified."}
        </p>

        {/* Button */}
        <Button
          onClick={() => window.location.href = "/"}
          className="bg-gradient-to-r from-cyan-600 to-teal-600 text-white"
        >
          Go to Home
        </Button>
      </div>
    </div>
  );
}