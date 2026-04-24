"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { useMutation } from "convex/react"
import { api } from "convex/_generated/api"

const ImDoctorPage = () => {
  const [form, setForm] = useState({
    name: "",
    specialization: "",
    location: "",
    fees: 0,
    description: "",
  })

  const [doctorImages, setDoctorImages] = useState<File[]>([])
  const [locationImages, setLocationImages] = useState<File[]>([])

  const [doctorPreview, setDoctorPreview] = useState<string[]>([])
  const [locationPreview, setLocationPreview] = useState<string[]>([])

  const [loading, setLoading] = useState(false)

  const generateUploadUrl = useMutation(api.storage.generateUploadUrl)
  const saveDoctorImages = useMutation(api.doctors.saveDoctorImages)

  // 🔥 Image Preview Handler
  const handleImageChange = (files: FileList | null, type: "doctor" | "location") => {
    if (!files) return

    const fileArray = Array.from(files)
    const previewUrls = fileArray.map((file) => URL.createObjectURL(file))

    if (type === "doctor") {
      setDoctorImages(fileArray)
      setDoctorPreview(previewUrls)
    } else {
      setLocationImages(fileArray)
      setLocationPreview(previewUrls)
    }
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)

    try {
      const uploadFile = async (file: File) => {
        const url = await generateUploadUrl()

        const result = await fetch(url, {
          method: "POST",
          body: file,
          headers: { "Content-Type": file.type },
        })

        const { storageId } = await result.json()
        return storageId
      }

      const doctorImageIds = await Promise.all(doctorImages.map(uploadFile))
      const locationImageIds = await Promise.all(locationImages.map(uploadFile))

      const doctorId = Date.now().toString()

      await saveDoctorImages({
        doctorId,
        email: "user@gmail.com",

        name: form.name,
        specialization: form.specialization,
        location: form.location,

        doctorImageIds,
        locationImageIds,

        fees: form.fees,
        description: form.description,
      })

      alert("✅ Doctor added successfully!")

      setForm({
        name: "",
        specialization: "",
        location: "",
        fees: 0,
        description: "",
      })

      setDoctorImages([])
      setLocationImages([])
      setDoctorPreview([])
      setLocationPreview([])

    } catch (err) {
      console.error(err)
      alert("❌ Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-teal-50 flex justify-center items-center p-6">
      
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-3xl space-y-6"
      >
        <h2 className="text-2xl font-bold text-center">👨‍⚕️ Add Doctor</h2>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            placeholder="Doctor Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="input"
          />

          <select
  name="specialization"
  value={form.specialization}
  onChange={(e) =>
    setForm({ ...form, specialization: e.target.value })
  }
  required
  className="w-full p-3 border border-gray-300 rounded-lg bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-500"
>
  <option value="">Select Issue</option>
  <option value="General">General (Fever, Cold)</option>
  <option value="Heart">Heart Problem</option>
  <option value="Skin">Skin Issue</option>
  <option value="Bone">Bone / Orthopedic</option>
  <option value="Child">Child Specialist</option>
  <option value="Women">Women / Gynecologist</option>
</select>

          <input
            placeholder="Location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="input"
          />

          <input
            type="number"
            placeholder="Fees"
            value={form.fees}
            onChange={(e) => setForm({ ...form, fees: Number(e.target.value) })}
            className="input"
          />
        </div>

        {/* Description */}
        <textarea
          placeholder="Doctor Description..."
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full p-3 border rounded-lg"
        />

        {/* Doctor Images */}
        <div>
          <label className="font-medium">Doctor Images</label>
          <input
            type="file"
            multiple
            onChange={(e) => handleImageChange(e.target.files, "doctor")}
          />

          <div className="flex gap-3 mt-3 flex-wrap">
            {doctorPreview.map((src, i) => (
              <motion.img
                key={i}
                src={src}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="w-24 h-24 object-cover rounded-lg shadow"
              />
            ))}
          </div>
        </div>

        {/* Location Images */}
        <div>
          <label className="font-medium">Hospital / Location Images</label>
          <input
            type="file"
            multiple
            onChange={(e) => handleImageChange(e.target.files, "location")}
          />

          <div className="flex gap-3 mt-3 flex-wrap">
            {locationPreview.map((src, i) => (
              <motion.img
                key={i}
                src={src}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="w-24 h-24 object-cover rounded-lg shadow"
              />
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-cyan-600 text-white py-3 rounded-lg hover:bg-cyan-700 transition"
        >
          {loading ? "Uploading..." : "🚀 Add Doctor"}
        </button>
      </motion.form>

      {/* Tailwind input style */}
      <style jsx>{`
        .input {
          padding: 12px;
          border: 1px solid #ccc;
          border-radius: 8px;
          outline: none;
        }
      `}</style>
    </div>
  )
}

export default ImDoctorPage