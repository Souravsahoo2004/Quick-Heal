"use client";

import { motion } from "framer-motion";
import { useRef } from "react";

export default function AboutPage() {

  // ✅ Proper TypeScript typing
  const storyRef = useRef<HTMLElement | null>(null);

  const scrollToStory = (): void => {
    storyRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="bg-white text-gray-800 overflow-hidden">

      {/* HERO */}
<section className="relative min-h-screen flex flex-col justify-center items-center text-center px-6 overflow-hidden bg-linear-to-b from-green-50 via-white to-white">

  {/* BACKGROUND GLOW */}
  <div className="absolute -top-24 -left-24 w-72 h-72 bg-green-300 rounded-full blur-3xl opacity-30"></div>
  <div className="absolute -bottom-32 -right-32 w-80  h-80 bg-green-200 rounded-full blur-3xl opacity-30"></div>

  {/* GRID */}
  <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size-40px_40px] opacity-20"></div>

 {/* 💊 GLOWING MEDICINE - HORIZONTAL */}
<div className="absolute inset-0 flex justify-center items-center pointer-events-none">
  <motion.div
    animate={{ y: [0, -14, 0] }}
    transition={{ repeat: Infinity, duration: 3.2, ease: "easeInOut" }}
    className="relative w-[66vw] flex items-center justify-center"
  >
    {/* Ambient pulse rings */}
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-full h-48 rounded-full border border-green-400 opacity-20 animate-ping"
        style={{ animationDuration: "2.4s" }} />
    </div>
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-[90%] h-40 rounded-full border border-green-400 opacity-20 animate-ping"
        style={{ animationDuration: "2.4s", animationDelay: "0.8s" }} />
    </div>

    <svg viewBox="0 0 900 220" className="w-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="pillglow" x="-30%" y="-60%" width="160%" height="220%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="vglow" x="-8%" y="-80%" width="116%" height="260%">
          <feGaussianBlur stdDeviation="2 14" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect x="10" y="10" width="880" height="200" rx="100"
        fill="#22c55e" opacity="0.10" filter="url(#pillglow)" />

      <rect x="10" y="10" width="880" height="200" rx="100" fill="#f0fdf4" />

      <ellipse cx="200" cy="70" rx="120" ry="22"
        fill="white" opacity="0.45" transform="rotate(-8 200 70)" />

      <line x1="110" y1="10" x2="790" y2="10"
        stroke="#22c55e" strokeWidth="3" strokeLinecap="round"
        filter="url(#vglow)" opacity="0.9">
        <animate attributeName="opacity"
          values="0.35;1;0.35" dur="2s" repeatCount="indefinite" />
      </line>

      <line x1="110" y1="210" x2="790" y2="210"
        stroke="#22c55e" strokeWidth="3" strokeLinecap="round"
        filter="url(#vglow)" opacity="0.9">
        <animate attributeName="opacity"
          values="0.35;1;0.35" dur="2s" begin="0.35s" repeatCount="indefinite" />
      </line>

      <rect x="10" y="10" width="880" height="200" rx="100"
        fill="none" stroke="#bbf7d0" strokeWidth="1.5" opacity="0.55" />

      

      <ellipse cx="450" cy="222" rx="340" ry="10"
        fill="#22c55e" opacity="0.10" />
    </svg>
  </motion.div>
</div>

  {/* CONTENT */}
  <div className="relative z-10">
    <motion.h1
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="text-4xl md:text-6xl font-bold text-green-600"
    >
      Quick Heal
    </motion.h1>

    <motion.p
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mt-4 text-lg md:text-xl max-w-2xl mx-auto"
    >
      Your first step towards smarter digital health, protection, and innovation.
    </motion.p>

    <motion.button
      onClick={scrollToStory}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="relative mt-8 px-8 py-3 bg-green-600 text-white rounded-full shadow-lg overflow-hidden"
    >
      <span className="relative z-10">Discover More</span>
      <span className="absolute inset-0 bg-green-400 opacity-0 hover:opacity-30 transition duration-300"></span>
    </motion.button>
  </div>

  {/* FLOAT ICON */}
  <motion.div
    animate={{ y: [0, -20, 0] }}
    transition={{ repeat: Infinity, duration: 3 }}
    className="absolute right-10 top-1/3 hidden md:block text-green-400 text-6xl opacity-30"
  >
    💊
  </motion.div>

</section>

      {/* STORY */}
      <section
        ref={storyRef}
        className="py-20 px-6 max-w-5xl mx-auto text-center"
      >
        <motion.h2
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-green-600"
        >
          Our First Step Towards Success
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-6 text-lg leading-relaxed"
        >
          Every startup begins with a simple idea. Quick Heal was born from the
          vision to create a platform that combines care, technology, and trust.
          Our journey started with small experiments, late-night coding, and a
          strong belief that we could build something meaningful.
          <br /><br />
          Today, we continue that journey — growing, improving, and delivering
          solutions that truly make a difference.
        </motion.p>
      </section>

      {/* TEAM */}
<section className="py-20 bg-green-50 px-6 text-center">
  <motion.h2
    initial={{ opacity: 0, y: 60 }}
    whileInView={{ opacity: 1, y: 0 }}
    className="text-3xl font-bold text-green-600"
  >
    Meet Our Team
  </motion.h2>

  <div className="mt-12 flex flex-wrap justify-center gap-10">

    {[
      {
        name: "Andu",
        role: "Full Stack Developer",
        img: "/team/teammem1.jpg",
      },
      {
        name: "Pandu",
        role: "Backend Engineer",
        img: "/team/teammem2.jpg",
      },
      {
        name: "Gandu",
        role: "UI/UX Designer",
        img: "/team/teammem3.jpg",
      },
    ].map(
      (
        member: { name: string; role: string; img: string },
        i: number
      ) => (
        <motion.div
          key={i}
          whileHover={{ scale: 1.08 }}
          className="bg-white p-6 rounded-2xl shadow-lg w-64 transition-all duration-300"
        >
          {/* IMAGE */}
          <div className="relative h-32 w-32 mx-auto mb-4">
            <img
              src={member.img}
              alt={member.name}
              className="h-full w-full object-cover rounded-full border-4 border-green-200 shadow-md"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://ui-avatars.com/api/?name=" +
                  member.name;
              }}
            />

            {/* ONLINE DOT (optional cool UI) */}
            <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></span>
          </div>

          <h3 className="font-semibold text-lg">{member.name}</h3>
          <p className="text-gray-500 text-sm">{member.role}</p>
        </motion.div>
      )
    )}

  </div>
</section>

      {/* UNIQUENESS */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-center text-green-600"
        >
          What Makes Us Trustworthy
        </motion.h2>

        <div className="grid md:grid-cols-2 gap-10 mt-12">

          {[
            {
              title: "Door-to-Door Delivery ",
              desc: "Fast & Reliable Delivery at Your Doorstep.Get your medicines and healthcare essentials delivered quickly and safely right to your home — saving time and effort.",
            },
            {
              title: "Doctor Appointment",
              desc: "Book Doctor Appointments at Your Convenience .Find and schedule appointments with nearby doctors at your preferred time, ensuring care when you need it most..",
            },
            {
              title: "Clinical Products",
              desc: "Clinically Approved Medical Products.Access a wide range of trusted and clinically tested medical products that meet high safety and quality standards.",
            },
            {
              title: "Certified Doctors",
              desc: "Consult with Verified & Certified Doctors.Connect with experienced and certified healthcare professionals you can trust for accurate guidance and treatment..",
            },
          ].map((item: { title: string; desc: string }, i: number) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.04 }}
              className="bg-green-50 p-6 rounded-xl shadow"
            >
              <h3 className="text-lg font-semibold text-green-700">
                {item.title}
              </h3>
              <p className="mt-2 text-gray-600">{item.desc}</p>
            </motion.div>
          ))}

        </div>
      </section>

      {/* MISSION */}
      <section className="py-20 text-center px-6">
        <motion.h2 className="text-3xl font-bold text-green-600">
          Our Mission
        </motion.h2>

        <motion.p className="mt-6 max-w-2xl mx-auto text-lg">
          To create a secure, intelligent, and user-friendly digital platform
          that empowers people with trust and technology.
        </motion.p>
      </section>

      {/* VISION */}
      <section className="py-20 bg-green-600 text-white text-center px-6">
        <motion.h2 className="text-3xl font-bold">
          Our Vision
        </motion.h2>

        <motion.p className="mt-6 max-w-2xl mx-auto text-lg">
          To become a trusted digital companion that blends healthcare-inspired
          design with powerful technology for the future.
        </motion.p>
      </section>

      {/* FUTURE */}
      <section className="py-20 px-6 text-center max-w-4xl mx-auto">
        <motion.h2 className="text-3xl font-bold text-green-600">
          Our Future Goals
        </motion.h2>

        <ul className="mt-8 space-y-4 text-lg">
          <li>🚀 Expand AI-powered features</li>
          <li>📱 Build cross-platform apps</li>
          <li>🔐 Enhance security systems</li>
          <li>🌍 Reach global users</li>
        </ul>
      </section>


    </div>
  );
}