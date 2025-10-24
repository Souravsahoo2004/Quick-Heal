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
        doc(firestore, "adminUsers", cred.user.uid), // Store in adminUsers
        {
          name,
          email: cred.user.email,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      await sendEmailVerification(cred.user);
      setMessage("Registration successful! Please verify your email before logging in.");
      setName("");
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
    <div className="bg-gradient-to-b from-gray-600 to-black justify-center items-center h-screen w-screen flex flex-col relative p-4 pt-24">
      <div className="flex items-center justify-center relative w-full max-w-md mb-6">
        <Button
          onClick={handleBack}
          variant="outline"
          className="absolute left-0 bg-transparent border-green-400 text-green-400 hover:bg-green-400 hover:text-white"
        >
          ← Back
        </Button>
        <h2 className="text-2xl font-bold text-center text-white">
          Create Admin<span className="text-green-400"> Account</span>
        </h2>
      </div>
      <div className="p-5 border border-gray-300 rounded">
        <form onSubmit={handleRegister} className="space-y-6 px-6 pb-4">
          <div>
            <label
              htmlFor="name"
              className="text-sm font-medium block mb-2 text-gray-300"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="border outline-none sm:text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5 bg-gray-600 border-gray-500 placeholder-gray-400 text-white"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="text-sm font-medium block mb-2 text-gray-300"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border outline-none sm:text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5 bg-gray-600 border-gray-500 placeholder-gray-400 text-white"
            />
          </div>
          <div className="flex space-x-4">
            <div className="w-1/2">
              <label
                htmlFor="password"
                className="text-sm font-medium block mb-2 text-gray-300"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border outline-none sm:text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5 bg-gray-600 border-gray-500 placeholder-gray-400 text-white"
              />
            </div>
            <div className="w-1/2">
              <label
                htmlFor="confirmPassword"
                className="text-sm font-medium block mb-2 text-gray-300"
              >
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="border outline-none sm:text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5 bg-gray-600 border-gray-500 placeholder-gray-400 text-white"
              />
            </div>
          </div>
          {error && <p className="text-red-500">{error}</p>}
          {message && <p className="text-green-500">{message}</p>}
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-offset-2 focus:ring-indigo-500 hover:transition-all hover:scale-105"
          >
            Sign Up
          </button>
        </form>
        <p className="text-sm font-medium text-gray-300 space-y-6 px-6 pb-4">
          Already have an account?{" "}
          <Link href="/Seller/Admin_Verify/Admin_Login" className="text-green-500 hover:underline ">
            LogIn here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AdminRegisterPage;
