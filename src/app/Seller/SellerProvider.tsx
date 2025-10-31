'use client'
import React from 'react'
import Navbar from './_Components/navbar';
import { ConvexClientProvider } from '../ConvexClientProvider';
import AdminFooter from './_Components/AdminFooter';

function SellerProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-screen">
      <ConvexClientProvider>
        <Navbar/>
        <main className="flex-grow">
          {children}
        </main>
        <AdminFooter/>
      </ConvexClientProvider>
    </div>
  )
}

export default SellerProvider
