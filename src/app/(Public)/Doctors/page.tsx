'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import React, { useState, ChangeEvent, FormEvent } from 'react'
import { auth } from '@/lib/firebase' // import Firebase Auth client

interface AppointmentForm {
  name: string
  email: string
  date: string
  doctor: string
  message: string
}

interface AppointmentDetails {
  name: string
  doctor: string
  date: string
  email: string
}

const DoctorAppointmentSection: React.FC = () => {
  const [form, setForm] = useState<AppointmentForm>({
    name: '',
    email: '',
    date: '',
    doctor: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [isSuccess, setIsSuccess] = useState<boolean>(false)
  const [appointmentDetails, setAppointmentDetails] = useState<AppointmentDetails | null>(null)
  const [error, setError] = useState<string>('')

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      // Read current user at submit time
      const u = auth.currentUser
      if (!u) {
        setError('Please log in to book an appointment.')
        return
      }

      // Include uid so server can store userId in Firestore
      const payload = { ...form, uid: u.uid }

      // Post to App Router route handler (/api/appointments)
      const response = await fetch('/api/appointment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (response.ok) {
        const pretty = new Date(form.date).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })

        setIsSuccess(true)
        setAppointmentDetails({
          name: form.name,
          doctor: form.doctor,
          date: pretty,
          email: form.email,
        })

        setForm({
          name: '',
          email: '',
          date: '',
          doctor: '',
          message: '',
        })

        setTimeout(() => {
          setIsSuccess(false)
          setAppointmentDetails(null)
        }, 10000)
      } else {
        setError(result.error || 'Failed to send appointment request')
      }
    } catch (error) {
      console.error('Submission error:', error)
      setError('Something went wrong. Please check your internet connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getMinDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  const getMaxDate = () => {
    const maxDate = new Date()
    maxDate.setMonth(maxDate.getMonth() + 3)
    return maxDate.toISOString().split('T')[0]
  }

  const handleNewBooking = () => {
    setIsSuccess(false)
    setAppointmentDetails(null)
  }

  return (
    <section className="relative w-full py-20 px-6 lg:px-24 bg-gradient-to-br from-cyan-50 via-white to-teal-50 overflow-hidden">
      {/* Animated Background Blobs */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.2, scale: 1 }}
        transition={{ duration: 1.2 }}
        className="absolute top-[-100px] right-[-100px] w-[400px] h-[400px] bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.2, scale: 1 }}
        transition={{ duration: 1.5, delay: 0.4 }}
        className="absolute bottom-[-120px] left-[-100px] w-[400px] h-[400px] bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40"
      />

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
        {/* Left Side: Illustration */}
        <motion.div
          initial={{ x: -60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="flex-1 flex justify-center"
        >
          <Image
            src="/images/Doctors Appoitment.png"
            alt="Doctor Appointment Booking"
            width={480}
            height={480}
            className="rounded-3xl shadow-lg drop-shadow-xl object-cover"
            priority
          />
        </motion.div>

        {/* Right Side: Form or Success Message */}
        <motion.div
          initial={{ x: 60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1 }}
          className="flex-1 bg-white/70 backdrop-blur-lg border border-cyan-100 rounded-3xl shadow-lg p-8 lg:p-10"
        >
          <AnimatePresence mode="wait">
            {isSuccess && appointmentDetails ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <div className="mb-6">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl">✅</span>
                  </div>
                  <h2 className="text-3xl font-bold text-green-600 mb-2">
                    Booking Request Successfully Sent!
                  </h2>
                  <p className="text-gray-600">
                    Your appointment request has been submitted
                  </p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                  <h3 className="font-semibold text-green-800 mb-3">📋 Appointment Details</h3>
                  <div className="space-y-2 text-left">
                    <p><strong>👤 Patient:</strong> {appointmentDetails.name}</p>
                    <p><strong>👨‍⚕️ Doctor:</strong> {appointmentDetails.doctor}</p>
                    <p><strong>📅 Preferred Date:</strong> {appointmentDetails.date}</p>
                    <p><strong>📧 Confirmation Email:</strong> {appointmentDetails.email}</p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-blue-800 mb-2">🚀 What's Next?</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>✅ Confirmation email sent to your inbox</li>
                    <li>📞 Our team will contact you within 24 hours</li>
                    <li>🏥 You'll receive exact appointment timing</li>
                  </ul>
                </div>

                <Button
                  onClick={handleNewBooking}
                  className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white py-2 px-6 rounded-lg font-semibold transition-all duration-300"
                >
                  📅 Book Another Appointment
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-800 mb-3">
                    👨‍⚕️ Book a Doctor Appointment
                  </h2>
                  <p className="text-gray-600">
                    Schedule your consultation with our expert medical professionals
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                    <strong>❌ Error:</strong> {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      minLength={2}
                      maxLength={50}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your full name"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your email address"
                    />
                  </div>

                  {/* Date and Doctor Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preferred Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="date"
                        value={form.date}
                        onChange={handleChange}
                        required
                        min={getMinDate()}
                        max={getMaxDate()}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Doctor <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="doctor"
                        value={form.doctor}
                        onChange={handleChange}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                      >
                        <option value="">Choose a Doctor</option>
                        <option value="Dr. Priya Sharma">Dr. Priya Sharma – General Physician</option>
                        <option value="Dr. Arjun Mehta">Dr. Arjun Mehta – Cardiologist</option>
                        <option value="Dr. Neha Patel">Dr. Neha Patel – Dermatologist</option>
                        <option value="Dr. Raj Verma">Dr. Raj Verma – Pediatrician</option>
                        <option value="Dr. Sunita Kumar">Dr. Sunita Kumar – Gynecologist</option>
                        <option value="Dr. Vikram Singh">Dr. Vikram Singh – Orthopedic</option>
                      </select>
                    </div>
                  </div>

                  {/* Health Concern */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Health Concern or Symptoms <span className="text-gray-500">(Optional)</span>
                    </label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      rows={4}
                      maxLength={500}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 resize-none"
                      placeholder="Briefly describe your symptoms or health concerns..."
                    />
                    <div className="text-right text-xs text-gray-500 mt-1">
                      {form.message.length}/500 characters
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white py-4 rounded-lg text-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="animate-spin inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-3"></span>
                        Sending Request...
                      </>
                    ) : (
                      <>📅 Book Appointment</>
                    )}
                  </Button>

                  {/* Disclaimer */}
                  <div className="text-center text-sm text-gray-500 mt-4">
                    <p>
                      By submitting this form, you agree to our terms of service and privacy policy.
                      <br />
                      We'll contact you within 24 hours to confirm your appointment.
                    </p>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  )
}

export default DoctorAppointmentSection
