"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth, firestore } from "@/lib/firebase";
import Link from "next/link";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Stethoscope, HeartPulse } from "lucide-react";

const AdminLoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (user.emailVerified) {
        await setDoc(
          doc(firestore, "adminUsers", user.uid),
          {
            lastLoginAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
        router.push("/Seller/Dashboard");
      } else {
        setError("Please verify your email before logging in.");
      }
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError("An unknown error occurred");
    }
  };

  const handleForgotPassword = async () => {
    setError(null);
    setMessage(null);

    if (!email) {
      setError("Please enter your email first.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent. Check your inbox.");
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError("Failed to send reset email");
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
              Admin <span className="text-cyan-400">Login</span>
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

        <form onSubmit={handleLogin} className="space-y-5">
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

          <div>
            <label className="text-sm text-gray-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full mt-1 p-3 rounded-xl bg-white/10 border border-gray-500 text-white focus:ring-2 focus:ring-cyan-400 outline-none"
            />
          </div>

          <div className="text-right">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm text-cyan-400 hover:underline"
            >
              Forgot Password?
            </button>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}
          {message && <p className="text-green-400 text-sm">{message}</p>}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-medium shadow-lg"
          >
            Login
          </motion.button>
        </form>

        <p className="text-sm text-gray-300 mt-6 text-center">
          Don&apos;t have an account?{' '}
          <Link
            href="/Seller/Admin_Verify/Admin_Resister"
            className="text-cyan-400 hover:underline"
          >
            Register here
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default AdminLoginPage;
