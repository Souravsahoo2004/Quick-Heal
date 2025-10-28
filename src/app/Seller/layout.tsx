import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "../globals.css";
import SellerProvider from "./SellerProvider";

export const metadata: Metadata = {
  title: "Quick Heal Admin",
  description: "Quick Heal app",
};

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["500"],
});

export default function SellerRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.className} bg-gray-50`}>
        <SellerProvider>
          {/* 🧱 Wrapper to add spacing below navbar for all Seller pages */}
          <div className=" pt-28">
            {children}
          </div>
        </SellerProvider>
      </body>
    </html>
  );
}
