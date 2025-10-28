"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { ShoppingCart, Stethoscope } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";

const menuOption = [
  { name: "Home", path: "/" },
  { name: "Products", path: "/Products" },
  { name: "Doctors", path: "/Doctors" },
  { name: "Orders", path: "/my-Orders" },
  { name: "Seller", path: "/Seller" },
  { name: "About", path: "/AboutPage" },
];

function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Get user's profile picture from Convex
  const convexUser = useQuery(
    api.users.getUserByUid,
    user ? { uid: user.uid } : "skip"
  );

  const hiddenMenuPaths = ["/Verify/login", "/Verify/resister"];
  const shouldShowMenuItems = !hiddenMenuPaths.includes(pathname);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });

    return () => unsubscribe();
  }, []);

  const handleLogoutAndRedirect = async () => {
    if (user) {
      try {
        await signOut(auth);
        localStorage.clear();
        sessionStorage.clear();
        router.push("/Seller/Admin_Verify/Admin_Login");
      } catch (error) {
        console.error("Error during logout:", error);
      }
    } else {
      router.push("/Seller/Admin_Verify/Admin_Login");
    }
  };

  const handleSellerClick = async () => {
    if (user) {
      await handleLogoutAndRedirect();
    } else {
      router.push("/Seller/Admin_Verify/Admin_Login");
    }
  };

  const handleProfileClick = () => {
    router.push("/User_profile");
  };

  // Get profile picture URL - prioritize Convex, fallback to default
  const profilePicture = convexUser?.photoURL || "/profile.png";

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center px-10 py-4 bg-white shadow-md">
      <div className="flex items-center gap-2 flex-1">
        <Link href="/" className="flex items-center gap-2">
          <img src={"/logo.svg"} alt="logo" height={30} width={30} />
          <h2 className="font-bold text-2xl">Quick Heal</h2>
        </Link>
      </div>

      {shouldShowMenuItems && (
        <div className="flex items-center gap-6 justify-center flex-1">
          {menuOption.map((menu, index) => {
            if (menu.name === "Seller") {
              return (
                <button
                  key={index}
                  onClick={handleSellerClick}
                  className="text-lg hover:scale-110 transition-all hover:text-green-600"
                >
                  {menu.name}
                </button>
              );
            }
            return (
              <Link href={menu.path} key={index}>
                <h2 className="text-lg hover:scale-110 transition-all hover:text-green-600">
                  {menu.name}
                </h2>
              </Link>
            );
          })}
        </div>
      )}

      <div className="flex items-center gap-4 justify-end flex-1 relative">
        <Link
          href="/Doctor-Consult"
          aria-label="Doctor Consult"
          title="Doctor Consult"
        >
          <Stethoscope
            size={24}
            className="text-gray-700 hover:text-green-600 transition-colors cursor-pointer"
          />
        </Link>

        <Link href="/Cart" aria-label="Cart" title="Cart">
          <ShoppingCart
            size={24}
            className="text-gray-700 hover:text-green-600 transition-colors cursor-pointer"
          />
        </Link>

        <button onClick={handleProfileClick} className="focus:outline-none">
          <img
            src={profilePicture}
            alt="Profile"
            className="rounded-full w-8 h-8 border-2 border-green-400 hover:scale-110 transition-transform object-cover"
          />
        </button>
      </div>
    </div>
  );
}

export default Navbar;
