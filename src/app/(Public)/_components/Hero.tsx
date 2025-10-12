'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const HeroSection: React.FC = () => {
  return (
    <section className="relative w-full min-h-[90vh] flex flex-col lg:flex-row items-center justify-between px-6 lg:px-24 py-16 overflow-hidden bg-gradient-to-br from-cyan-50 via-white to-teal-50">
      {/* Background Animated Blobs */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.25, scale: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute top-[-100px] right-[-100px] w-[450px] h-[450px] bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.25, scale: 1 }}
        transition={{ duration: 1.8, delay: 0.4 }}
        className="absolute bottom-[-120px] left-[-100px] w-[400px] h-[400px] bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40"
      />

      {/* Left Content */}
      <motion.div
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="z-10 flex-1 text-center lg:text-left"
      >
        <h1 className="text-5xl md:text-6xl font-bold text-gray-800 leading-tight mb-6">
          Trusted Healthcare, <br /> <span className="text-cyan-600">Delivered to Your Doorstep</span>
        </h1>
        <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto lg:mx-0">
          Experience seamless online medicine shopping with <span className="font-semibold text-cyan-700">Quick Heal</span>.
          Get your prescriptions, wellness products, and healthcare essentials quickly and safely — anytime, anywhere.
        </p>

        <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
          <Link href="/Products">
            <Button
              size="lg"
              className="bg-cyan-600 hover:bg-cyan-700 text-white rounded-2xl px-8 py-6 shadow-md hover:shadow-lg transition-all duration-300"
            >
              🛒 Shop Medicines
            </Button>
          </Link>

          <Link href="/Doctors">
            <Button
              size="lg"
              variant="outline"
              className="rounded-2xl px-8 py-6 border-cyan-600 text-cyan-700 hover:bg-cyan-50 shadow-sm hover:shadow-md transition-all duration-300"
            >
               Consult Doctor 👨‍⚕️
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Right Image */}
      <motion.div
        initial={{ x: 60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative flex-1 flex justify-center mt-10 lg:mt-0 z-10"
      >
        <div className="relative w-[480px] h-[480px] rounded-3xl overflow-hidden shadow-2xl border border-cyan-100 backdrop-blur-lg">
          <Image
            src="/Hero-img.png"
            alt="Trusted Healthcare Team"
            fill
            className="object-cover transition-transform duration-700 hover:scale-105"
            priority
          />
        </div>

        {/* Floating pill-like shapes */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute top-10 right-10 w-16 h-16 bg-cyan-100 rounded-full shadow-inner border border-cyan-200"
        />
        <motion.div
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 4, repeat: Infinity, delay: 0.8 }}
          className="absolute bottom-10 left-10 w-20 h-10 bg-teal-100 rounded-full rotate-12 shadow-inner border border-teal-200"
        />
      </motion.div>
    </section>
  )
}

export default HeroSection
