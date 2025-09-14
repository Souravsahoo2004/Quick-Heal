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
         <div className='pt-16'>
        {children}
        </div>
      </div>
    </div>
  ) 
}

export default Provider
