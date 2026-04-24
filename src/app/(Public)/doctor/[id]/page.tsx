"use client"

import { useParams } from "next/navigation"
import { useQuery } from "convex/react"
import { api } from "convex/_generated/api"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"


const DoctorDetails = () => {
  const params = useParams()
  const id = params?.id as string | undefined

  const doctor = useQuery(
    api.doctors.getDoctorById,
    id ? { id: id as any } : "skip"
  )

  const reviews = useQuery(
  api.doctors.getDoctorReviews,
  id ? { doctorId: id as any } : "skip"
);

const router = useRouter();

  if (!id) return <p>Invalid URL</p>
  if (doctor === undefined) return <p>Loading...</p>
  if (doctor === null) return <p>Doctor not found</p>

  return (
    <div className="bg-gray-50 min-h-screen p-6">

      {/* 🔹 HEADER CARD */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-lg rounded-2xl p-6 flex gap-6"
      >
        <img
          src={doctor.imageUrl || "/default-doctor.png"}
          className="w-40 h-40 rounded-xl object-cover"
        />

        <div className="flex-1">
          <h1 className="text-3xl font-bold">{doctor.name}</h1>
          <p className="text-gray-500">{doctor.specialization}</p>

          <div className="flex gap-4 mt-3 text-sm">
            <span>⭐ {doctor.rating}</span>
            <span>💬 {doctor.reviews} reviews</span>
            <span>💰 ₹{doctor.fees}</span>
          </div>

          <p className="mt-2 text-gray-600">📍 {doctor.location}</p>

         <button
  onClick={() => router.push("/Doctors")}
  className="mt-4 bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700"
>
  Book Appointment
</button>
        </div>
      </motion.div>

      {/* 🔹 LOCATION IMAGE */}
      {doctor.locationImageUrl && (
        <motion.img
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          src={doctor.locationImageUrl}
          className="mt-6 w-full h-64 object-cover rounded-xl shadow"
        />
      )}

      {/* 🔹 ABOUT SECTION */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white mt-6 p-6 rounded-xl shadow"
      >
        <h2 className="text-xl font-semibold mb-2">About Doctor</h2>
        <p className="text-gray-700">
          {doctor.description || "Experienced specialist with excellent patient care."}
        </p>
      </motion.div>

      {/* 🔹 REVIEWS SECTION */}
      <div className="mt-6 bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4">Patient Reviews</h2>

        {!reviews && <p>Loading reviews...</p>}

        {reviews?.length === 0 && <p>No reviews yet</p>}

        {reviews?.map((rev: any) => (
          <div key={rev._id} className="border-b py-3">
            <p className="text-yellow-500">⭐ {rev.rating}</p>
            <p className="text-gray-700">{rev.review}</p>
            <p className="text-xs text-gray-400">
              {new Date(rev.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>

      {/* 🔙 BACK */}
      <button
        onClick={() => window.history.back()}
        className="mt-6 text-cyan-600"
      >
        ← Back
      </button>
    </div>
  )
}

export default DoctorDetails