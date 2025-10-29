"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { auth } from "@/lib/firebase";
import {
  onAuthStateChanged,
  signOut,
  User,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";

const menuOption = [
  
  { name: "Dashboard", path: "/Seller/Dashboard" },
  { name: "Management", path: "/Seller/Management" },
  { name: "Orders", path: "/Seller/Admin_Orders" },
  { name: "buyer", path: "/" },

 
];

function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Get admin's profile picture from Convex
  const convexAdmin = useQuery(
    api.adminUsers.getAdminByUid,
    user ? { uid: user.uid } : "skip"
  );

  // Hide menu items on specific admin auth pages
  const hiddenMenuPaths = [
    "/Seller/Admin_Verify/Admin_Login",
    "/Seller/Admin_Verify/Admin_Resister",
  ];
  const shouldShowMenuItems = !hiddenMenuPaths.includes(pathname);

  // keep session persistent for smoother re-login
  useEffect(() => {
    setPersistence(auth, browserLocalPersistence);
  }, []);

  // handle auth state and auto-restore stored user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        localStorage.setItem(
          "lastUser",
          JSON.stringify({
            email: firebaseUser.email,
            uid: firebaseUser.uid,
            photoURL: firebaseUser.photoURL,
          })
        );
      } else {
        const storedUser = localStorage.getItem("lastUser");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Admin logout handler
  const handleLogout = async () => {
    await signOut(auth);
    localStorage.clear();
    sessionStorage.clear();
    router.push("/Seller/Admin_Verify/Admin_Login");
  };

  // special "Home" click handler: log out admin, restore last user later
  const handleHomeClick = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      localStorage.setItem(
        "previousUser",
        JSON.stringify({
          email: currentUser.email,
          uid: currentUser.uid,
        })
      );
      await signOut(auth);
    }
    router.push("/");
  };

  // Get profile picture URL - prioritize Convex, fallback to default
  const profilePicture = convexAdmin?.photoURL || "/profile.png";

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center px-10 py-4 bg-white shadow-md">
      {/* Left: Logo and Name */}
      <div className="flex items-center gap-2 flex-1">
        <button onClick={handleHomeClick} className="flex items-center gap-2">
          <img src={"/logo.svg"} alt="logo" height={30} width={30} />
          <h2 className="font-bold text-2xl">Quick Heal</h2>
        </button>
      </div>

      {/* Center: Menu Options */}
      {shouldShowMenuItems && (
        <div className="flex items-center gap-6 justify-center flex-1">
          {menuOption.map((menu, index) =>
            menu.name === "Home" ? (
              <button key={index} onClick={handleHomeClick}>
                <h2 className="text-lg hover:scale-110 transition-all hover:text-green-600">
                  {menu.name}
                </h2>
              </button>
            ) : (
              <Link href={menu.path} key={index}>
                <h2 className="text-lg hover:scale-110 transition-all hover:text-green-600">
                  {menu.name}
                </h2>
              </Link>
            )
          )}
        </div>
      )}

      {/* Right: User Profile (click → profile page) */}
      <div className="flex items-center gap-4 justify-end flex-1 relative">
        <button
          onClick={() => router.push("/Seller/Admin_profile")}
          className="focus:outline-none"
          title="Profile"
        >
          <img
            src={profilePicture}
            alt="Profile"
            className="rounded-full w-8 h-8 border-2 border-green-400 hover:scale-105 transition-transform object-cover"
          />
        </button>
      </div>
    </div>
  );
}

export default Navbar;
