"use client";

import { motion } from "framer-motion";
import { FaUserMd, FaUserAlt } from "react-icons/fa";

const testimonials = [
  {
    name: "Rahul Das",
    role: "Recovered Patient",
    review:
      "QuickHeal made my treatment so easy. I consulted a doctor within minutes and got proper guidance without hospital visits.",
  },
  {
    name: "Ananya Sharma",
    role: "Mother of Patient",
    review:
      "Very helpful platform. The doctors are professional and prescriptions are clear. My child got treated quickly.",
  },
  {
    name: "Dr. Mehta",
    role: "Cardiologist",
    review:
      "As a doctor, I find QuickHeal very efficient for managing patients and follow-ups. Smooth and reliable system.",
  },
  {
    name: "Sourav Sahoo",
    role: "Tech User",
    review:
      "UI is clean, booking is fast, and the experience feels like a real hospital system online.",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="w-full py-24 px-4 md:px-16 bg-linear-to-b from-[#f8fbff] via-[#eef6ff] to-[#e9f8f9]">
      
      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center text-3xl md:text-4xl font-bold text-gray-900 mb-14"
      >
        What People Say About <span className="text-[#008FC8]">QuickHeal</span>
      </motion.h2>

      {/* Cards */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        
        {testimonials.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15 }}
            whileHover={{ y: -8 }}
            className="bg-white/80 backdrop-blur-md border border-white/40 shadow-lg rounded-2xl p-6 relative"
          >
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-[#008FC8]/10 rounded-full">
                {item.role.includes("Doctor") ? (
                  <FaUserMd className="text-[#008FC8] text-2xl" />
                ) : (
                  <FaUserAlt className="text-[#008FC8] text-2xl" />
                )}
              </div>
            </div>

            {/* Review */}
            <p className="text-gray-600 text-sm text-center mb-5">
              “{item.review}”
            </p>

            {/* Name */}
            <h4 className="text-center font-semibold text-gray-900">
              {item.name}
            </h4>

            {/* Role */}
            <p className="text-center text-xs text-gray-500">
              {item.role}
            </p>

            {/* Decorative glow */}
            <div className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition bg-[#008FC8]/5 pointer-events-none"></div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}