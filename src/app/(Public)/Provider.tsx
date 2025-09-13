'use client'
import React from 'react'
import Navbar from './_components/Navbar';

function Provider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <div>
         <Navbar/>
        {children}
      </div>
    </div>
  ) 
}

export default Provider
