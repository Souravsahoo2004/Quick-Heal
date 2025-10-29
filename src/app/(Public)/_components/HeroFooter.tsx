"use client";
import { motion } from "framer-motion";
import { FaHeartbeat, FaUserMd, FaPills, FaShieldAlt } from "react-icons/fa";

export default function FollowUpSection() {
  return (
    <section className="relative bg-gradient-to-br from-[#f8fbff] via-[#eef6ff] to-[#e9f8f9] py-24 px-6 md:px-16 overflow-hidden">
      {/* Floating Counters */}
      <div className="max-w-6xl mx-auto mb-20 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-4xl md:text-5xl font-bold text-gray-900 mb-8"
        >
          Trusted by Millions Across India 🌍
        </motion.h2>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12"
        >
          {[
            { value: "50K+", label: "Happy Patients" },
            { value: "350+", label: "Specialist Doctors" },
            { value: "98%", label: "Treatment Success" },
            { value: "24/7", label: "Support Available" },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.05 }}
              className="bg-white/80 backdrop-blur-sm shadow-md rounded-2xl p-6"
            >
              <p className="text-3xl md:text-4xl font-bold text-[#008FC8] mb-2">
                {item.value}
              </p>
              <p className="text-gray-700 font-medium">{item.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Services Section */}
      <div className="max-w-6xl mx-auto">
        <motion.h3
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16"
        >
          Explore Our Healthcare Solutions 💙
        </motion.h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {[
            {
              icon: <FaHeartbeat className="text-4xl text-[#008FC8]" />,
              title: "Online Consultation",
              desc: "Connect instantly with top doctors via chat or video.",
            },
            {
              icon: <FaPills className="text-4xl text-[#008FC8]" />,
              title: "Medicine Delivery",
              desc: "Order medicines online and get them at your doorstep.",
            },
            {
              icon: <FaUserMd className="text-4xl text-[#008FC8]" />,
              title: "Health Checkups",
              desc: "Book affordable lab tests and full-body checkups easily.",
            },
            {
              icon: <FaShieldAlt className="text-4xl text-[#008FC8]" />,
              title: "Health Insurance",
              desc: "Choose from best policies that protect your health.",
            },
          ].map((card, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -8, boxShadow: "0px 12px 20px rgba(0,0,0,0.1)" }}
              className="bg-white rounded-2xl p-8 text-center shadow-lg transition"
            >
              <div className="flex justify-center mb-4">{card.icon}</div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">
                {card.title}
              </h4>
              <p className="text-gray-600">{card.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
