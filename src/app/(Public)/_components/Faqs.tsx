"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    q: "How do I book an appointment on QuickHeal?",
    a: "You can easily book an appointment by selecting a doctor, choosing a time slot, and confirming instantly.",
  },
  {
    q: "Is online consultation available?",
    a: "Yes, QuickHeal provides secure video and chat consultations with verified doctors anytime.",
  },
  {
    q: "Are my medical records safe?",
    a: "Absolutely. All records are encrypted and stored securely using Firebase security standards.",
  },
  {
    q: "Can I cancel or reschedule my appointment?",
    a: "Yes, you can manage your bookings anytime from the dashboard before the scheduled time.",
  },
  {
    q: "What services does QuickHeal provide?",
    a: "We offer online consultation, prescriptions, health checkups, and specialist doctor access.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="w-full py-20 px-4 md:px-16 bg-linear-to-b from-[#f8fbff] via-[#eef6ff] to-[#e9f8f9]">
      
      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center text-3xl md:text-4xl font-bold text-gray-900 mb-12"
      >
        Quick<span className="text-[#008FC8]">Heal</span> Frequently Asked Questions
      </motion.h2>

      {/* FAQ Container */}
      <div className="max-w-3xl mx-auto space-y-5">

        {faqs.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/80 backdrop-blur-md border border-white/40 shadow-md rounded-2xl overflow-hidden"
          >
            {/* Question */}
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full flex justify-between items-center px-6 py-5 text-left hover:bg-white/60 transition"
            >
              <span className="font-medium text-gray-800">
                {item.q}
              </span>

              <motion.span
                animate={{ rotate: openIndex === index ? 45 : 0 }}
                className="text-[#008FC8] text-2xl font-light"
              >
                +
              </motion.span>
            </button>

            {/* Answer */}
            <AnimatePresence>
              {openIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="px-6 pb-5 text-gray-600 text-sm leading-relaxed"
                >
                  {item.a}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </section>
  );
}