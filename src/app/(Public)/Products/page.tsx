// src/app/(Public)/Products/page.tsx
'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import React, { useMemo } from 'react'
import { useCart } from '@/contexts/CartContext'
import { useQuery } from 'convex/react'
import { api } from '../../../../convex/_generated/api'

interface Product {
  id: number | string
  slug: string
  name: string
  price: number
  oldPrice: number
  discount: number
  image: string
}

// Your existing static products
const staticProducts: Product[] = [
  
 
 
]

const FeaturedProducts: React.FC = () => {
  const { addToCart } = useCart()

  // Fetch admin-uploaded products from Convex database
  const adminProducts = useQuery(api.products.getAllProducts)

  // Combine static products with admin products
  const allProducts = useMemo(() => {
    // If admin products haven't loaded yet, just show static products
    if (!adminProducts) return staticProducts

    // Transform admin products to match Product interface
    const transformedAdminProducts: Product[] = adminProducts.map((product) => {
      // Calculate discount percentage if discountedPrice exists
      const discount = product.discountedPrice 
        ? Math.round(((product.price - product.discountedPrice) / product.price) * 100)
        : 0

      // Determine final price (use discounted price if available)
      const finalPrice = product.discountedPrice || product.price

      return {
        id: product._id,
        slug: product.productName.toLowerCase().replace(/\s+/g, '-'),
        name: product.productName,
        price: finalPrice,
        oldPrice: product.price,
        discount: discount,
        image: product.imageUrls && product.imageUrls.length > 0 
          ? product.imageUrls[0] 
          : '/images/placeholder.png',
      }
    })

    // Combine static and admin products
    return [...staticProducts, ...transformedAdminProducts]
  }, [adminProducts])

  const handleAddToCart = (product: Product) => {
    // Centralized toast is fired inside CartContext.addToCart
    addToCart(product)
  }

  return (
    <section className="w-full py-20 px-6 lg:px-24 bg-white">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {allProducts.map((product: Product, index: number) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
            className="relative bg-white rounded-2xl shadow-md hover:shadow-xl border border-gray-100 overflow-hidden transition-all duration-300"
          >
            {product.discount > 0 && (
              <span className="absolute top-3 left-3 bg-orange-500 text-white text-sm font-semibold px-2 py-1 rounded-md z-10">
                -{product.discount}%
              </span>
            )}

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
                {product.discount > 0 && (
                  <span className="text-gray-400 line-through text-sm">₹{product.oldPrice}</span>
                )}
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