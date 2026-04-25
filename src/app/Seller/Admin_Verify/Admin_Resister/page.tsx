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
import { Stethoscope, HeartPulse } from "lucide-react";

const AdminRegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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
        doc(firestore, "adminUsers", cred.user.uid),
        {
          name,
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

      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError("An unknown error occurred");
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-linear-to-br from-blue-900 via-slate-900 to-black overflow-hidden">

      {/* background blobs */}
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

      {/* card */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-3xl p-8 w-full max-w-md z-10"
      >
        {/* header */}
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
              Admin <span className="text-cyan-400">Register</span>
            </h2>
          </div>
        </div>

        {/* icon */}
        <div className="flex justify-center mb-6">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="p-4 bg-cyan-500/20 rounded-full"
          >
            <HeartPulse className="text-cyan-400 w-8 h-8" />
          </motion.div>
        </div>

        {/* form */}
        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="text-sm text-gray-300">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full mt-1 p-3 rounded-xl bg-white/10 border border-gray-500 text-white focus:ring-2 focus:ring-cyan-400 outline-none"
            />
          </div>

          <div>
            <label className="text-sm text-gray-300">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full mt-1 p-3 rounded-xl bg-white/10 border border-gray-500 text-white focus:ring-2 focus:ring-cyan-400 outline-none"
            />
          </div>

          <div className="flex gap-3">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-1/2 p-3 rounded-xl bg-white/10 border border-gray-500 text-white focus:ring-2 focus:ring-cyan-400"
            />

            <input
              type="password"
              placeholder="Confirm"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-1/2 p-3 rounded-xl bg-white/10 border border-gray-500 text-white focus:ring-2 focus:ring-cyan-400"
            />
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
          <Link
            href="/Seller/Admin_Verify/Admin_Login"
            className="text-cyan-400 hover:underline"
          >
            LogIn here
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default AdminRegisterPage;
