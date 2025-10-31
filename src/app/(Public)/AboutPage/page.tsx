"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { FaLinkedin } from "react-icons/fa";

export default function AboutPage() {
  return (
    <main className="relative min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 text-gray-800 py-20 px-6 md:px-20">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
        {/* Image Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 30 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex-1 flex flex-col items-center justify-center"
        >
          <div className="relative w-72 h-72 md:w-96 md:h-96">
            <Image
              src="/developer.jpg"
              alt="Developer Image"
              fill
              className="object-cover rounded-2xl shadow-2xl border border-gray-200"
            />
            {/* Floating glow effects */}
            <motion.div
              className="absolute -top-5 -left-5 w-16 h-16 bg-blue-500 rounded-full blur-2xl opacity-40"
              animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <motion.div
              className="absolute -bottom-6 -right-6 w-20 h-20 bg-purple-500 rounded-full blur-2xl opacity-30"
              animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
          </div>

          {/* Developer Info */}
          <div className="text-center mt-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              Sourav Sahoo
            </h2>
            <p className="text-gray-600 text-sm">Developer & CEO</p>
            <motion.a
              href="https://www.linkedin.com/in/sourav-sahoo7/"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center gap-2 text-blue-600 mt-3 hover:text-blue-800 transition-colors"
            >
              <FaLinkedin className="text-xl" />
              <span className="font-medium">LinkedIn Profile</span>
            </motion.a>
          </div>
        </motion.div>

        {/* Text Section */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex-1 space-y-6"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            About <span className="text-blue-600">Us</span>
          </h1>

          <p className="text-gray-700 text-lg leading-relaxed">
            Welcome to <span className="font-semibold text-blue-600">Quick Heal</span> —
            a next-generation platform designed to provide fast, secure, and intelligent
            digital experiences. Our mission is to merge technology with simplicity,
            empowering users and businesses to manage their world with confidence.
          </p>

          <p className="text-gray-700 text-lg leading-relaxed">
            We are a passionate team of developers, designers, and innovators dedicated
            to building reliable, performance-driven applications. With a focus on
            creativity and precision, we turn complex ideas into beautiful, functional,
            and scalable digital solutions.
          </p>

          {/* Mailto Button */}
          <motion.a
            href="mailto:souravsahoo72051@gmail.com"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-blue-400/50 transition-all duration-300"
          >
            Get in Touch →
          </motion.a>
        </motion.div>
      </div>

      {/* Floating background animation */}
      <motion.div
        className="absolute top-10 left-10 w-24 h-24 bg-blue-200 rounded-full mix-blend-multiply filter blur-2xl opacity-30"
        animate={{ y: [0, 20, 0], x: [0, 15, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-10 right-10 w-32 h-32 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
        animate={{ y: [0, -20, 0], x: [0, -15, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
      />
    </main>
  );
}
