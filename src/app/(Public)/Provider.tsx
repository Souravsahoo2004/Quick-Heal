'use client'
import React from 'react'
import Navbar from './_components/Navbar';
import { AppProgressBar as ProgressBar } from 'next-nprogress-bar';
import { CartProvider } from '../../contexts/CartContext';
import type { ReactNode } from 'react';
import { SonnerToaster } from '@/components/sonner-toaster';
import { ConvexClientProvider } from '../ConvexClientProvider';

function Provider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <div>
        
         <div className='pt-16'>
          <ConvexClientProvider>
          <CartProvider>
             <Navbar/>
            {children}
            <SonnerToaster />
          </CartProvider>
          </ConvexClientProvider>
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
