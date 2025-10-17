// src/app/(Public)/Product/[slug]/page.tsx
'use client'

import React, { useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Star, ShoppingCart, Zap, ShieldCheck, ArrowRight } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'

type ProductFull = {
  id: number
  slug: string
  name: string
  price: number
  oldPrice?: number
  discount?: number
  rating: number
  ratingCount: number
  reviewCount: number
  images: string[]
  highlights: string[]
}

const CATALOG: Record<string, ProductFull> = {
  'paracetamol-500mg-tablets': {
    id: 1,
    slug: 'paracetamol-500mg-tablets',
    name: 'Paracetamol 500mg Tablets',
    price: 50,
    oldPrice: 60,
    discount: 20,
    rating: 4.6,
    ratingCount: 1278,
    reviewCount: 214,
    images: ['/images/paracetamol.png'],
    highlights: [
      'Effective relief from fever and mild pain',
      '500 mg strength for quick action',
      'Recommended adult dosage on label',
      'Store in a cool, dry place',
      'Consult physician if symptoms persist',
    ],
  },
  'cough-syrup-quick-relief': {
    id: 2,
    slug: 'cough-syrup-quick-relief',
    name: 'Cough Syrup – Quick Relief',
    price: 120,
    oldPrice: 150,
    discount: 10,
    rating: 4.3,
    ratingCount: 842,
    reviewCount: 129,
    images: ['/images/cough-syrough.png'],
    highlights: [
      'Soothes throat irritation and dry cough',
      'Non-drowsy formula',
      'Sugar-free variant suitable for diabetics',
      'Read label for dosage instructions',
      'Not recommended for children under 3 years',
    ],
  },
  'vitamin-c-immunity-booster': {
    id: 3,
    slug: 'vitamin-c-immunity-booster',
    name: 'Vitamin C Immunity Booster',
    price: 220,
    oldPrice: 250,
    discount: 12,
    rating: 4.5,
    ratingCount: 1964,
    reviewCount: 310,
    images: ['/images/vitaminc-Immunity-booster.png'],
    highlights: [
      '1000 mg Vitamin C per serving',
      'Supports daily immunity',
      'Orange flavor, easy to consume',
      'No added preservatives',
      'Consult healthcare professional for allergies',
    ],
  },
  'digital-thermometer-fast-read': {
    id: 4,
    slug: 'digital-thermometer-fast-read',
    name: 'Digital Thermometer – Fast Read',
    price: 350,
    oldPrice: 400,
    discount: 15,
    rating: 4.4,
    ratingCount: 654,
    reviewCount: 98,
    images: ['/images/digital thermometer.png'],
    highlights: [
      'Accurate readings in 10 seconds',
      'Auto shut-off to save battery',
      'Memory function for last reading',
      'Water-resistant probe tip',
      '1-year limited warranty',
    ],
  },
  'common-cold-tablets': {
    id: 5,
    slug: 'common-cold-tablets',
    name: 'Common Cold Tablets',
    price: 150,
    oldPrice: 300,
    discount: 50,
    rating: 4.2,
    ratingCount: 733,
    reviewCount: 121,
    images: ['/images/common cold tablets.png'],
    highlights: [
      'Relief from cold and nasal congestion',
      'Non-drowsy daytime formula',
      'Follow dosage on pack',
      'Keep away from children',
      'Consult doctor if pregnant or nursing',
    ],
  },
  'diabetic-care-tablets': {
    id: 6,
    slug: 'diabetic-care-tablets',
    name: 'Diabetic Care Tablets',
    price: 750,
    oldPrice: 1000,
    discount: 5,
    rating: 4.1,
    ratingCount: 398,
    reviewCount: 67,
    images: ['/images/diabetic care tablets.png'],
    highlights: [
      'Supports diabetic wellness regimen',
      'Sugar-free formulation',
      'Use as advised by physician',
      'Check ingredients for allergens',
      'Not a substitute for medication',
    ],
  },
  'nicotine-syrup': {
    id: 7,
    slug: 'nicotine-syrup',
    name: 'Nicotine Syrup',
    price: 1550,
    oldPrice: 2000,
    discount: 15,
    rating: 4.0,
    ratingCount: 221,
    reviewCount: 39,
    images: ['/images/nicotic syrough.png'],
    highlights: [
      'Formulated to support cessation programs',
      'Use under medical supervision',
      'Read contraindications carefully',
      'Store below 25°C',
      'Keep out of reach of children',
    ],
  },
  'fruit-juice': {
    id: 8,
    slug: 'fruit-juice',
    name: 'Fruit Juice',
    price: 250,
    oldPrice: 400,
    discount: 15,
    rating: 4.3,
    ratingCount: 512,
    reviewCount: 76,
    images: ['/images/fruit juice1.png'],
    highlights: [
      '100% fruit content, no preservatives',
      'Rich in natural vitamins',
      'Serve chilled for best taste',
      'Shake well before use',
      'Refrigerate after opening',
    ],
  },
}

export default function ProductDescriptionPage() {
  const { slug } = useParams<{ slug: string }>()
  const product = useMemo<ProductFull | null>(() => CATALOG[slug] ?? null, [slug])
  const router = useRouter()
  const { addToCart } = useCart()

  if (!product) {
    return (
      <section className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-semibold">Product not found</h1>
        <p className="text-gray-600 mt-2">Browse products and pick another item.</p>
        <div className="mt-6">
          <Link href="/Products" className="text-blue-600 hover:underline">Go to Products</Link>
        </div>
      </section>
    )
  }

  const cartShape = {
    id: product.id,
    name: product.name,
    price: product.price,
    oldPrice: product.oldPrice ?? product.price,
    discount: product.discount ?? 0,
    image: product.images[0],
  }

  const handleAddToCart = () => {
    addToCart(cartShape as any)
  }

  const handleBuyNow = () => {
    addToCart(cartShape as any)
    router.push('/Checkout')
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-10">
      {/* Left: Product Image Gallery */}
      <div className="space-y-4">
        <div className="relative w-full h-96 rounded-2xl overflow-hidden shadow-md">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-contain bg-white"
            priority
          />
        </div>
        <div className="flex gap-2 justify-center">
          {product.images.slice(1).map((img, index) => (
            <div
              key={index}
              className="relative w-20 h-20 border rounded-lg hover:scale-105 transition-all cursor-pointer bg-white"
            >
              <Image src={img} alt={`${product.name} view ${index + 1}`} fill className="object-contain" />
            </div>
          ))}
        </div>
      </div>

      {/* Right: Product Details */}
      <div className="space-y-5">
        <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
        <p className="flex items-center gap-2 text-yellow-500">
          <Star fill="gold" size={18} /> {product.rating} ★ | {product.ratingCount.toLocaleString()} Ratings & {product.reviewCount} Reviews
        </p>

        <div className="flex items-end gap-3">
          <div className="text-3xl font-semibold text-green-600">₹{product.price.toLocaleString()}</div>
          {product.oldPrice && (
            <p className="text-gray-500 text-sm line-through">₹{product.oldPrice.toLocaleString()}</p>
          )}
        </div>
        <p className="text-sm text-gray-700">Inclusive of all taxes</p>

        <div className="flex gap-4 mt-6">
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-lg rounded-xl flex items-center gap-2"
            onClick={handleAddToCart}
          >
            <ShoppingCart size={18} /> Add to Cart
          </Button>
          <Button
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 text-lg rounded-xl flex items-center gap-2"
            onClick={handleBuyNow}
          >
            <Zap size={18} /> Buy Now
          </Button>
        </div>

        {/* Offers (static for now) */}
        <Card className="mt-6 border-blue-100 shadow-sm">
          <CardHeader>
            <h3 className="text-xl font-semibold text-gray-900">Available Offers</h3>
          </CardHeader>
          <CardContent className="space-y-2 text-gray-700">
            <p>💳 Bank Offer: 10% off on Axis Bank Credit Card</p>
            <p>🚚 Free delivery on your first order</p>
            <p>🔄 Exchange Offer: Up to ₹2,000 off on old phone</p>
          </CardContent>
        </Card>

        {/* Highlights */}
        <div className="mt-6 space-y-3">
          <h3 className="text-xl font-semibold text-gray-900">Highlights</h3>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            {product.highlights.map((h, i) => (
              <li key={i}>{h}</li>
            ))}
          </ul>
        </div>

        {/* Warranty */}
        <div className="flex items-center gap-2 mt-6 text-gray-700">
          <ShieldCheck size={20} className="text-green-600" />
          <p>1 Year Manufacturer Warranty for Device & 6 Months for Accessories</p>
        </div>
      </div>

      {/* Related Products */}
      <div className="col-span-2 mt-12">
        <h2 className="text-2xl font-bold mb-6">Related Products</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
          {Object.values(CATALOG)
            .filter((p) => p.slug !== product.slug)
            .slice(0, 4)
            .map((p) => (
              <Card key={p.slug} className="hover:shadow-lg transition-all cursor-pointer group rounded-2xl overflow-hidden">
                <div className="relative w-full h-52 bg-white">
                  <Image
                    src={p.images[0]}
                    alt={p.name}
                    fill
                    className="object-contain group-hover:scale-105 transition-all"
                  />
                </div>
                <CardContent className="p-4 space-y-1">
                  <h4 className="font-semibold text-gray-800">{p.name}</h4>
                  <p className="text-green-600 font-medium">₹{p.price.toLocaleString()}</p>
                  <Link href={`/Product/${p.slug}`} className="text-blue-600 inline-flex items-center gap-1 hover:underline">
                    View More <ArrowRight size={16} />
                  </Link>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
    </section>
  )
}
