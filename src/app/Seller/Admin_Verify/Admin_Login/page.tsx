"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, firestore } from "@/lib/firebase";
import Link from "next/link";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";

const AdminLoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (user.emailVerified) {
        await setDoc(
          doc(firestore, "adminUsers", user.uid), // Store in adminUsers
          {
            lastLoginAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
        router.push("/Seller/Dashboard"); // or wherever the admin home is
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

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="bg-gradient-to-b from-gray-600 to-black justify-center items-center h-screen w-screen flex flex-col relative pt-24">
      <div className="flex items-center justify-center gap-6 mb-10 w-full max-w-lg">
        <Button
          onClick={handleBack}
          variant="outline"
          className="bg-transparent border-green-400 text-green-400 hover:bg-green-400 hover:text-white px-4 py-2 mr-10 mt-2"
        >
          ← Back
        </Button>
        <h2 className="text-4xl font-medium text-white">
          Admin <span className="text-green-400">Login</span>
        </h2>
      </div>
      <div className="p-5 border border-gray-300 rounded">
        <form onSubmit={handleLogin} className="space-y-6 px-6 pb-4">
          <div className="mb-5">
            <label htmlFor="email" className="text-sm font-medium block mb-2 text-gray-300">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border-2 outline-none sm:text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5 bg-gray-600 border-gray-500 placeholder-gray-400 text-white"
            />
          </div>
          <div className="mb-8">
            <label htmlFor="password" className="text-sm font-medium block mb-2 text-gray-300">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border-2 outline-none sm:text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5 bg-gray-600 border-gray-500 placeholder-gray-400 text-white"
            />
          </div>
          {error && <p className="text-red-500">{error}</p>}
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-offset-2 focus:ring-indigo-500 hover:transition-all hover:scale-105"
          >
            Login
          </button>
        </form>
        <p className="text-sm font-medium text-gray-300 space-y-6 px-6 pb-4">
          Don't have an account?{" "}
          <Link href="/Seller/Admin_Verify/Admin_Resister" className="text-green-500 hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AdminLoginPage;
