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
import { Menu, X } from "lucide-react";
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
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

  // Set client-side flag to prevent hydration issues
  useEffect(() => {
    setIsClient(true);
  }, []);

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
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Get profile picture URL - prioritize Convex, fallback to default
  const profilePicture = convexAdmin?.photoURL || "/profile.png";

  // Don't render until client-side to prevent hydration mismatch
  if (!isClient) {
    return null;
  }

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center px-4 md:px-10 py-4 bg-white shadow-md">
        {/* Left: Logo and Name */}
        <div className="flex items-center gap-2 flex-1">
          <button onClick={handleHomeClick} className="flex items-center gap-2" suppressHydrationWarning>
            <img src={"/logo.svg"} alt="logo" height={30} width={30} />
            <h2 className="font-bold text-xl md:text-2xl">Quick Heal</h2>
          </button>
        </div>

        {/* Center: Desktop Menu Options */}
        {shouldShowMenuItems && (
          <div className="hidden lg:flex items-center gap-6 justify-center flex-1">
            {menuOption.map((menu, index) =>
              menu.name === "buyer" ? (
                <button key={index} onClick={handleHomeClick} suppressHydrationWarning>
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

        {/* Right: User Profile and Mobile Menu Toggle */}
        <div className="flex items-center gap-3 md:gap-4 justify-end flex-1 relative">
          <button
            onClick={() => router.push("/Seller/Admin_profile")}
            className="focus:outline-none"
            title="Profile"
            suppressHydrationWarning
          >
            <img
              src={profilePicture}
              alt="Profile"
              className="rounded-full w-8 h-8 border-2 border-green-400 hover:scale-105 transition-transform object-cover"
            />
          </button>

          {/* Mobile Menu Toggle */}
          {shouldShowMenuItems && (
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden focus:outline-none"
              aria-label="Toggle Menu"
              suppressHydrationWarning
            >
              <Menu size={28} className="text-gray-700" />
            </button>
          )}
        </div>
      </div>

      {/* Mobile Sidebar Menu */}
      {shouldShowMenuItems && (
        <>
          {/* Sidebar */}
          <div
            className={`fixed top-0 right-0 h-screen w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 lg:hidden ${
              isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            {/* Close Button */}
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="font-bold text-xl">Menu</h2>
              <button
                onClick={toggleMobileMenu}
                className="focus:outline-none"
                aria-label="Close Menu"
                suppressHydrationWarning
              >
                <X size={28} className="text-gray-700 hover:text-red-500" />
              </button>
            </div>

            {/* Menu Items */}
            <nav className="flex flex-col p-4">
              {menuOption.map((menu, index) =>
                menu.name === "buyer" ? (
                  <button
                    key={index}
                    onClick={handleHomeClick}
                    className="text-lg py-3 text-left hover:text-green-600 hover:bg-gray-100 px-3 rounded-md transition-colors"
                    suppressHydrationWarning
                  >
                    {menu.name}
                  </button>
                ) : (
                  <Link
                    href={menu.path}
                    key={index}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <h2 className="text-lg py-3 hover:text-green-600 hover:bg-gray-100 px-3 rounded-md transition-colors">
                      {menu.name}
                    </h2>
                  </Link>
                )
              )}
            </nav>
          </div>
        </>
      )}
    </>
  );
}

export default Navbar;
