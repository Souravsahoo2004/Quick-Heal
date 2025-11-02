'use client'
import React from 'react'
import Navbar from './_components/Navbar';
import { AppProgressBar as ProgressBar } from 'next-nprogress-bar';
import { CartProvider } from '../../contexts/CartContext';
import type { ReactNode } from 'react';
import { SonnerToaster } from '@/components/sonner-toaster';
import { ConvexClientProvider } from '../ConvexClientProvider';
import Footer from './_components/Footer';

function Provider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen w-full">
      <ConvexClientProvider>
        <CartProvider>
          <Navbar/>
          <div className="pt-16 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 w-full max-w-screen-2xl mx-auto">
            {children}
            <Footer/>
          </div>
          <SonnerToaster />
        </CartProvider>
      </ConvexClientProvider>
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
