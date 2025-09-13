import type { Metadata } from "next";
import {Outfit} from "next/font/google";
import "../globals.css";
import Provider from "./Provider";




export const metadata: Metadata = {
  title: "Quick Heal",
  description: "QUick Heal app",
};

const outfit = Outfit ({
  subsets: ["latin"],
  weight:['500']
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={outfit.className}
      >
        <Provider>
          
        {children}
       
        </Provider>
      </body>
    </html>
  );
}
