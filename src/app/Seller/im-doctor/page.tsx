"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useMutation, useQuery } from "convex/react"
import { api } from "convex/_generated/api"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged, User } from "firebase/auth"

const ImDoctorPage = () => {
  const [user, setUser] = useState<User | null>(null)

  const [form, setForm] = useState({
    name: "",
    specialization: "",
    location: "",
    fees: 0,
    description: "",
  })

  const [loading, setLoading] = useState(false)
  const [editMode, setEditMode] = useState(false)

  const generateUploadUrl = useMutation(api.storage.generateUploadUrl)
  const saveDoctor = useMutation(api.doctors.saveDoctorImages)
  const deleteDoctor = useMutation(api.doctors.deleteDoctor)
  const updateDoctor = useMutation(api.doctors.updateDoctor)
  const [doctorImages, setDoctorImages] = useState<File[]>([])
const [locationImages, setLocationImages] = useState<File[]>([])

const [doctorPreview, setDoctorPreview] = useState<string[]>([])
const [locationPreview, setLocationPreview] = useState<string[]>([])

  // ✅ Firebase user
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u))
    return () => unsub()
  }, [])

  const userId = user?.uid

  // ✅ Fetch doctor
  const doctor = useQuery(
    api.doctors.getDoctorByUserId,
    userId ? { userId } : "skip"
  )

  // ✅ Submit
 const handleSubmit = async (e: any) => {
  e.preventDefault()

  if (!userId || !user?.email) {
    alert("Login properly (email missing)")
    return
  }

  setLoading(true)

  try {
    if (editMode && doctor) {
      await updateDoctor({
        id: doctor._id,
        ...form,
      })
      alert("✅ Updated successfully")
      setEditMode(false)
    } else {
      if (doctor) {
        alert("⚠️ You already added a doctor")
        return
      }

// 🔥 upload images FIRST
const doctorImageIds = await Promise.all(
  doctorImages.map(uploadFile)
)

const locationImageIds = await Promise.all(
  locationImages.map(uploadFile)
)

// 🔥 then save
await saveDoctor({
  doctorId: Date.now().toString(),
  userId,
  email: user.email,

  ...form,

  doctorImageIds,
  locationImageIds,
})

      alert("✅ Doctor added")
    }

    setForm({
      name: "",
      specialization: "",
      location: "",
      fees: 0,
      description: "",
    })
  } catch (err) {
    console.error(err)
    alert("❌ Error")
  } finally {
    setLoading(false)
  }
}


const handleEdit = () => {
  if (!doctor) return

  setForm({
    name: doctor.name,
    specialization: doctor.specialization,
    location: doctor.location,
    fees: doctor.fees,
    description: doctor.description || "",
  })

  setEditMode(true)
}


const handleImageChange = (
  files: FileList | null,
  type: "doctor" | "location"
) => {
  if (!files) return

  const fileArray = Array.from(files)
  const previewUrls = fileArray.map((file) =>
    URL.createObjectURL(file)
  )

  if (type === "doctor") {
    setDoctorImages(fileArray)
    setDoctorPreview(previewUrls)
  } else {
    setLocationImages(fileArray)
    setLocationPreview(previewUrls)
  }
}

const uploadFile = async (file: File) => {
  const url = await generateUploadUrl()

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": file.type },
    body: file,
  })

  const { storageId } = await res.json()
  return storageId
}


  // ✅ UI STATES

  if (!user) {
    return <p className="text-center mt-10">🔐 Please login first</p>
  }

  if (doctor === undefined) {
    return <p className="text-center mt-10">Loading...</p>
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-cyan-50 to-teal-100 p-6">

      {/* 🔥 SHOW PROFILE */}
      {doctor && !editMode ? (
      <motion.div
  initial={{ opacity: 0, y: 40 }}
  animate={{ opacity: 1, y: 0 }}
  className="bg-white/80 backdrop-blur-xl border shadow-2xl rounded-3xl p-6 w-full max-w-2xl space-y-5"
>
  {/* 🔥 Doctor Header */}
  <div className="flex items-center gap-4">
    {doctor.doctorImages?.[0] && (
      <img
        src={doctor.doctorImages[0]}
        className="w-20 h-20 rounded-full object-cover shadow"
      />
    )}

    <div>
      <h2 className="text-2xl font-bold text-cyan-700">
        Dr. {doctor.name}
      </h2>
      <p className="text-sm text-gray-500">
        {doctor.specialization}
      </p>
    </div>
  </div>

  {/* 🔥 Info */}
  <div className=" gap-4 ">
    <p>Location : {doctor.location}</p>
    <span className="columns-2">Appointment Fees:
    <p className="text-green-600 font-semibold"> 
      ₹ {doctor.fees}
    </p>
    </span>
  </div>

  <p className="text-gray-700">{doctor.description}</p>

  {/* ⭐ Rating */}
  <div className="flex items-center gap-2">
    <span className="text-yellow-500 font-bold">
      ⭐ {doctor.rating || 0}
    </span>
    <span className="text-gray-500 text-sm">
      ({doctor.reviews} reviews)
    </span>
  </div>

  {/* 🧑‍⚕️ Doctor Images */}
  

  {/* 🏥 Hospital Images */}
  <div>
    <p className="font-medium mb-2">Hospital</p>
    <div className="flex gap-3 overflow-x-auto">
  {doctor.locationImages
  ?.filter((img): img is string => img !== null)
  .map((img, i) => (
    <img
      key={i}
      src={img}
      className="w-24 h-24 rounded-xl object-cover shadow hover:scale-110 transition"
    />
))}
    </div>
  </div>

  {/* 🔥 Buttons */}
  <div className="flex gap-3 pt-2">
    <button
      onClick={handleEdit}
      className="bg-yellow-500 px-4 py-2 rounded-xl text-white hover:scale-105 transition"
    >
      ✏️ Update
    </button>

    <button
      onClick={() => deleteDoctor({ id: doctor._id })}
      className="bg-red-500 px-4 py-2 rounded-xl text-white hover:scale-105 transition"
    >
      🗑 Delete
    </button>
  </div>
</motion.div>
      ) : (
        /* 🔥 FORM */
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white/70 backdrop-blur-xl shadow-2xl rounded-3xl p-8 w-full max-w-2xl space-y-6"
        >
          <h2 className="text-2xl font-bold text-center">
            {editMode ? "✏️ Update Doctor" : "👨‍⚕️ Add Doctor"}
          </h2>

          <input
            placeholder="Doctor Name"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
            className="input"
          />

          <select
  value={form.specialization}
  onChange={(e) =>
    setForm({ ...form, specialization: e.target.value })
  }
  className="input"
  required
>
  <option value="">Select Issue</option>
  <option value="General Fever">General (Fever, Cold)</option>
  <option value="Heart Issue">Heart Problem</option>
  <option value="Skin Issue">Skin Issue</option>
  <option value="Bone Problem">Bone / Orthopedic</option>
  <option value="Child Specialist">Child Specialist</option>
  <option value="Women">Women / Gynecologist</option>
</select>

          <input
            placeholder="Location"
            value={form.location}
            onChange={(e) =>
              setForm({ ...form, location: e.target.value })
            }
            className="input"
          />

         <input
  type="number"
  placeholder="Doctor Fees"
  value={form.fees || ""}
  min={0}
  onChange={(e) =>
    setForm({
      ...form,
      fees: Math.max(0, Number(e.target.value)),
    })
  }
  className="input"
/>

   <div>
  <label className="font-medium block mb-2">Doctor Images</label>

  <label className="cursor-pointer inline-block bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-2 rounded-xl shadow hover:scale-105 transition">
    📸 Upload Doctor Photos
    <input
      type="file"
      multiple
      hidden
      onChange={(e) =>
        handleImageChange(e.target.files, "doctor")
      }
    />
  </label>

  <div className="flex gap-2 mt-3 flex-wrap">
    {doctorPreview.map((src, i) => (
      <img
        key={i}
        src={src}
        className="w-20 h-20 rounded-xl object-cover shadow hover:scale-110 transition"
      />
    ))}
  </div>
</div>

<div>
  <label className="font-medium block mb-2">Hospital Images</label>

  <label className="cursor-pointer inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-xl shadow hover:scale-105 transition">
    🏥 Upload Hospital Photos
    <input
      type="file"
      multiple
      hidden
      onChange={(e) =>
        handleImageChange(e.target.files, "location")
      }
    />
  </label>

  <div className="flex gap-2 mt-3 flex-wrap">
    {locationPreview.map((src, i) => (
      <img
        key={i}
        src={src}
        className="w-20 h-20 rounded-xl object-cover shadow hover:scale-110 transition"
      />
    ))}
  </div>
</div>


          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            className="input"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 text-white py-3 rounded-lg hover:scale-105 transition"
          >
            {loading
  ? "Publishing..."
  : editMode
  ? "Update Profile"
  : "Publish Profile"}
          </button>
        </motion.form>
      )}

      <style jsx>{`
        .input {
          width: 100%;
          padding: 12px;
          border: 1px solid #ccc;
          border-radius: 10px;
        }
      `}</style>
    </div>
  )
}

export default ImDoctorPage