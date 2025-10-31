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
          {/* Responsive wrapper with adjusted padding for different screen sizes */}
          <div className="pt-16 sm:pt-20 md:pt-24 lg:pt-28 px-4 sm:px-6 lg:px-8 min-h-screen">
            {children}
          </div>
        </SellerProvider>
      </body>
    </html>
  );
}
