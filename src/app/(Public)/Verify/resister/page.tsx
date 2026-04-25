"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { auth, firestore } from "@/lib/firebase";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { motion } from "framer-motion";
import { Stethoscope, HeartPulse, Eye, EyeOff } from "lucide-react";

const RegisterPage = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleRegister = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);

      await setDoc(
        doc(firestore, "users", cred.user.uid),
        {
          firstName,
          lastName,
          gender,
          email: cred.user.email,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      await sendEmailVerification(cred.user);

      setMessage(
        "Registration successful! Please verify your email before logging in."
      );

      setFirstName("");
      setLastName("");
      setGender("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 via-slate-900 to-black overflow-hidden">

      {/* Animated Background */}
      <motion.div
        className="absolute w-72 h-72 bg-cyan-500 rounded-full blur-3xl opacity-20"
        animate={{ x: [0, 100, -50, 0], y: [0, -50, 50, 0] }}
        transition={{ duration: 12, repeat: Infinity }}
      />

      <motion.div
        className="absolute w-72 h-72 bg-green-500 rounded-full blur-3xl opacity-20"
        animate={{ x: [0, -100, 50, 0], y: [0, 50, -50, 0] }}
        transition={{ duration: 15, repeat: Infinity }}
      />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-3xl p-8 w-full max-w-md z-10"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            onClick={handleBack}
            variant="outline"
            className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-white"
          >
            ← Back
          </Button>

          <div className="flex items-center gap-2 text-white">
            <Stethoscope className="text-cyan-400" />
            <h2 className="text-2xl font-semibold">
              Quick<span className="text-cyan-400">Heal</span>
            </h2>
          </div>
        </div>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="p-4 bg-cyan-500/20 rounded-full"
          >
            <HeartPulse className="text-cyan-400 w-8 h-8" />
          </motion.div>
        </div>

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="w-1/2 p-3 rounded-xl bg-white/10 border border-gray-500 text-white focus:ring-2 focus:ring-cyan-400"
            />
            <input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="w-1/2 p-3 rounded-xl bg-white/10 border border-gray-500 text-white focus:ring-2 focus:ring-cyan-400"
            />
          </div>

          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            required
            className="w-full p-3 rounded-xl bg-white/10 border border-gray-500 text-white focus:ring-2 focus:ring-cyan-400"
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-3 rounded-xl bg-white/10 border border-gray-500 text-white focus:ring-2 focus:ring-cyan-400"
          />

          <div className="flex gap-3">
            <div className="relative w-1/2">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-3 pr-10 rounded-xl bg-white/10 border border-gray-500 text-white focus:ring-2 focus:ring-cyan-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-300"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="relative w-1/2">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full p-3 pr-10 rounded-xl bg-white/10 border border-gray-500 text-white focus:ring-2 focus:ring-cyan-400"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3 text-gray-300"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}
          {message && <p className="text-green-400 text-sm">{message}</p>}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-medium shadow-lg"
          >
            Sign Up
          </motion.button>
        </form>

        <p className="text-sm text-gray-300 mt-6 text-center">
          Already have an account?{' '}
          <Link href="/Verify/login" className="text-cyan-400 hover:underline">
            Login here
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default RegisterPage;