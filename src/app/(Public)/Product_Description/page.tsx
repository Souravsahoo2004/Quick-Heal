'use client';

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Star, ShoppingCart, Zap, ShieldCheck, ArrowRight } from 'lucide-react';

export default function ProductDescription() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-10">
      {/* Left: Product Image Gallery */}
      <div className="space-y-4">
        <div className="relative w-full h-96 rounded-2xl overflow-hidden shadow-md">
          <Image
            src="/images/oppo-k13x.png"
            alt="OPPO K13x 5G"
            fill
            className="object-contain bg-white"
          />
        </div>
        <div className="flex gap-2 justify-center">
          {['/images/oppo-front.png', '/images/oppo-back.png', '/images/oppo-side.png'].map(
            (img, index) => (
              <div
                key={index}
                className="relative w-20 h-20 border rounded-lg hover:scale-105 transition-all cursor-pointer"
              >
                <Image src={img} alt={`Oppo view ${index + 1}`} fill className="object-cover" />
              </div>
            )
          )}
        </div>
      </div>

      {/* Right: Product Details */}
      <div className="space-y-5">
        <h1 className="text-3xl font-bold text-gray-900">OPPO K13x 5G (Breeze Blue, 128 GB)</h1>
        <p className="flex items-center gap-2 text-yellow-500">
          <Star fill="gold" size={18} /> 4.5 ★ | 2,134 Ratings & 340 Reviews
        </p>

        <div className="text-3xl font-semibold text-green-600">₹9,499</div>
        <p className="text-gray-500 text-sm line-through">₹13,499</p>
        <p className="text-sm text-gray-700">Inclusive of all taxes</p>

        <div className="flex gap-4 mt-6">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-lg rounded-xl flex items-center gap-2">
            <ShoppingCart size={18} /> Add to Cart
          </Button>
          <Button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 text-lg rounded-xl flex items-center gap-2">
            <Zap size={18} /> Buy Now
          </Button>
        </div>

        {/* Offers Section */}
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
            <li>8 GB RAM | 128 GB ROM | Expandable up to 1 TB</li>
            <li>6.72 inch Full HD+ Display (120Hz Refresh Rate)</li>
            <li>6000 mAh Battery | 45W SUPERVOOC Fast Charging</li>
            <li>64MP + 8MP Dual Rear Camera | 16MP Front Camera</li>
            <li>Qualcomm Snapdragon 6 Gen 1 Processor</li>
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
          {[
            { name: 'OPPO A79 5G', price: '₹13,999', img: '/images/oppo-a79.png' },
            { name: 'Realme 12x 5G', price: '₹12,499', img: '/images/realme-12x.png' },
            { name: 'Redmi Note 13 5G', price: '₹14,999', img: '/images/redmi-13.png' },
            { name: 'Vivo T3 5G', price: '₹15,499', img: '/images/vivo-t3.png' },
          ].map((product, i) => (
            <Card
              key={i}
              className="hover:shadow-lg transition-all cursor-pointer group rounded-2xl overflow-hidden"
            >
              <div className="relative w-full h-52 bg-white">
                <Image
                  src={product.img}
                  alt={product.name}
                  fill
                  className="object-contain group-hover:scale-105 transition-all"
                />
              </div>
              <CardContent className="p-4 space-y-1">
                <h4 className="font-semibold text-gray-800">{product.name}</h4>
                <p className="text-green-600 font-medium">{product.price}</p>
                <Button variant="ghost" className="text-blue-600 p-0 hover:underline">
                  View More <ArrowRight size={16} />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
