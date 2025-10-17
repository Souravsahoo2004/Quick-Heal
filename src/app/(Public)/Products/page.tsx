// src/app/(Public)/Products/page.tsx
'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import React from 'react'
import { useCart } from '@/contexts/CartContext'

interface Product {
  id: number
  slug: string
  name: string
  price: number
  oldPrice: number
  discount: number
  image: string
}

const products: Product[] = [
  {
    id: 1,
    slug: 'paracetamol-500mg-tablets',
    name: 'Paracetamol 500mg Tablets',
    price: 50,
    oldPrice: 60,
    discount: 20,
    image: '/images/paracetamol.png',
  },
  {
    id: 2,
    slug: 'cough-syrup-quick-relief',
    name: 'Cough Syrup – Quick Relief',
    price: 120,
    oldPrice: 150,
    discount: 10,
    image: '/images/cough-syrough.png',
  },
  {
    id: 3,
    slug: 'vitamin-c-immunity-booster',
    name: 'Vitamin C Immunity Booster',
    price: 220,
    oldPrice: 250,
    discount: 12,
    image: '/images/vitaminc-Immunity-booster.png',
  },
  {
    id: 4,
    slug: 'digital-thermometer-fast-read',
    name: 'Digital Thermometer – Fast Read',
    price: 350,
    oldPrice: 400,
    discount: 15,
    image: '/images/digital thermometer.png',
  },
  {
    id: 5,
    slug: 'common-cold-tablets',
    name: 'Common Cold Tablets',
    price: 150,
    oldPrice: 300,
    discount: 50,
    image: '/images/common cold tablets.png',
  },
  {
    id: 6,
    slug: 'diabetic-care-tablets',
    name: 'Diabetic Care Tablets',
    price: 750,
    oldPrice: 1000,
    discount: 5,
    image: '/images/diabetic care tablets.png',
  },
  {
    id: 7,
    slug: 'nicotine-syrup',
    name: 'Nicotine Syrup',
    price: 1550,
    oldPrice: 2000,
    discount: 15,
    image: '/images/nicotic syrough.png',
  },
  {
    id: 8,
    slug: 'fruit-juice',
    name: 'Fruit Juice',
    price: 250,
    oldPrice: 400,
    discount: 15,
    image: '/images/fruit juice1.png',
  },
]

const FeaturedProducts: React.FC = () => {
  const { addToCart } = useCart()

  const handleAddToCart = (product: Product) => {
    // Centralized toast is fired inside CartContext.addToCart
    addToCart(product)
  }

  return (
    <section className="w-full py-20 px-6 lg:px-24 bg-white">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {products.map((product: Product, index: number) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
            className="relative bg-white rounded-2xl shadow-md hover:shadow-xl border border-gray-100 overflow-hidden transition-all duration-300"
          >
            <span className="absolute top-3 left-3 bg-orange-500 text-white text-sm font-semibold px-2 py-1 rounded-md">
              -{product.discount}%
            </span>

            <div className="w-full h-52 flex items-center justify-center bg-[#fefcfb]">
              <Image
                src={product.image}
                alt={product.name}
                width={180}
                height={180}
                className="object-contain transition-transform duration-500 hover:scale-105"
              />
            </div>

            <div className="p-5 text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{product.name}</h3>
              <div className="flex justify-center items-center gap-3 mb-4">
                <span className="text-cyan-600 font-bold text-xl">₹{product.price}</span>
                <span className="text-gray-400 line-through text-sm">₹{product.oldPrice}</span>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  size="sm"
                  className="w-full bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl py-2 shadow-md hover:shadow-lg transition-all"
                  onClick={() => handleAddToCart(product)}
                >
                  Add to cart
                </Button>
                <Link
                  href={`/Product/${product.slug}`}
                  className="mt-1 inline-block text-blue-600 hover:underline"
                >
                  View
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

export default FeaturedProducts
