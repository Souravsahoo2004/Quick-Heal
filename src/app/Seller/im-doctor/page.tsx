'use client'

import React, { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";

const ImDoctorPage = () => {

  const [form, setForm] = useState({
    name: "",
    specialization: "",
    location: "",
    rating: 0,
    reviews: 0,
    fees: 0,
  });

  const [doctorImages, setDoctorImages] = useState<File[]>([]);
  const [locationImages, setLocationImages] = useState<File[]>([]);

  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const saveDoctorImages = useMutation(api.doctors.saveDoctorImages);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    // 🔥 1. Upload images to Convex
    const uploadFile = async (file: File) => {
      const url = await generateUploadUrl();

      const result = await fetch(url, {
        method: "POST",
        body: file,
        headers: { "Content-Type": file.type },
      });

      const { storageId } = await result.json();
      return storageId;
    };

    const doctorImageIds = await Promise.all(
      doctorImages.map(uploadFile)
    );

    const locationImageIds = await Promise.all(
      locationImages.map(uploadFile)
    );

    // 🔥 2. Save in Convex
    const doctorId = Date.now().toString(); // or use uid

 await saveDoctorImages({
  doctorId,
  email: "user@gmail.com", // ✅ ADD THIS

  name: form.name,
  specialization: form.specialization,
  location: form.location,

  doctorImageIds,
  locationImageIds,

  rating: form.rating,
  reviews: form.reviews,
  fees: form.fees,
});

    // 🔥 3. Save in Firebase
    await fetch("/api/addDoctor", {
      method: "POST",
      body: JSON.stringify({
        ...form,
        doctorId,
        email: "user@gmail.com", // get from auth
      }),
    });

    alert("Doctor added successfully!");
  };

  return (
    <form onSubmit={handleSubmit} className="p-10 space-y-4">

      <input placeholder="Name" onChange={e => setForm({...form, name: e.target.value})} />
      <input placeholder="Specialization" onChange={e => setForm({...form, specialization: e.target.value})} />
      <input placeholder="Location" onChange={e => setForm({...form, location: e.target.value})} />
      <input type="number" placeholder="Fees" onChange={e => setForm({...form, fees: Number(e.target.value)})} />

      {/* Doctor Images */}
      <input type="file" multiple onChange={(e) => setDoctorImages(Array.from(e.target.files || []))} />

      {/* Location Images */}
      <input type="file" multiple onChange={(e) => setLocationImages(Array.from(e.target.files || []))} />

      <button type="submit">Submit</button>

    </form>
  );
};

export default ImDoctorPage;