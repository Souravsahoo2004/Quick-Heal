'use client'
import React from 'react'

import { ConvexClientProvider } from '../ConvexClientProvider';


import Admin_Navbar from './_Components/Admin_Navbar';
import Admin_Footer from './_Components/Admin_Footer';



function SellerProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-screen">
      <ConvexClientProvider>
       <Admin_Navbar/>
        <main className="flex-grow">
          {children}
        </main>
      <Admin_Footer/>
      </ConvexClientProvider>
    </div>
  )
}

export default SellerProvider
