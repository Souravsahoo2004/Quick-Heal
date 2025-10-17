'use client'
import React from 'react'
import Navbar from './_components/Navbar';
import { AppProgressBar as ProgressBar } from 'next-nprogress-bar';
import { CartProvider } from '../../contexts/CartContext';
import type { ReactNode } from 'react';
import { SonnerToaster } from '@/components/sonner-toaster';

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
          <CartProvider>
            {children}
            <SonnerToaster />
          </CartProvider>
        </div>
      </div>
      <ProgressBar
        height="4px"
        color="#0ea5e9"
        options={{ showSpinner: false }}
        shallowRouting
        delay={100}
      />
    </div>
  ) 
}

export default Provider
