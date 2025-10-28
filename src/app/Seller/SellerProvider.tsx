'use client'
import React from 'react'
import Navbar from './_Components/navbar';
import { ConvexClientProvider } from '../ConvexClientProvider';

function SellerProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <ConvexClientProvider>
        <Navbar/>
      {children}
      </ConvexClientProvider>
    </div>
  )
}

export default SellerProvider
