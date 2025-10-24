'use client'
import React from 'react'
import Navbar from './_Components/navbar';

function SellerProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
        <Navbar/>
      {children}
    </div>
  )
}

export default SellerProvider
