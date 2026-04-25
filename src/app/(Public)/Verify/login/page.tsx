"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth, firestore } from "@/lib/firebase";
import Link from "next/link";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Stethoscope, HeartPulse, Eye, EyeOff } from "lucide-react";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      if (user.emailVerified) {
        await setDoc(
          doc(firestore, "users", user.uid),
          {
            lastLoginAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );

        router.push("/");
      } else {
        setError("Please verify your email before logging in.");
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
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
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to send reset email");
      }
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 via-slate-900 to-black overflow-hidden">

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
              className="w-full mt-1 p-3 rounded-xl bg-white/10 border border-gray-500 text-white focus:ring-2 focus:ring-cyan-400 outline-none transition"
            />
          </div>

          <div className="relative">
            <label className="text-sm text-gray-300">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full mt-1 p-3 pr-10 rounded-xl bg-white/10 border border-gray-500 text-white focus:ring-2 focus:ring-cyan-400 outline-none transition"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-gray-300 hover:text-cyan-400"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
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
          <Link href="/Verify/resister" className="text-cyan-400 hover:underline">
            Register here
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;