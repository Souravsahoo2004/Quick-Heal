'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Truck, Star, ShoppingBag } from 'lucide-react';

type ProductType = 'solid' | 'liquid';

interface Product {
  id: number;
  name: string;
  description: string;
  image: string;
  category: string;
  price: number;
  discount: number;
  type: ProductType;
  unit: string; // e.g., 'pcs' or 'ml'
  rating: number;
  stock: number;
}

export default function ProductDetailsPage() {
  // Mock Product (you’ll fetch this from backend later)
  const product: Product = {
    id: 1,
    name: 'Paracetamol 500mg',
    description:
      'Paracetamol 500mg helps reduce fever and relieve pain such as headaches, muscle aches, and toothaches. Recommended dosage as per doctor’s advice.',
    image: '/images/para.jpg',
    category: 'Pain Relief',
    price: 50,
    discount: 10, // in %
    type: 'solid',
    unit: 'pcs',
    rating: 4.5,
    stock: 50,
  };

  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState('');
  const discountedPrice = product.price - (product.price * product.discount) / 100;
  const total = discountedPrice * quantity;

  const handleIncrease = () => {
    setQuantity(prev => prev + 1);
  };

  const handleDecrease = () => {
    setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  };

  const handleAddToCart = () => {
    alert(`${quantity} ${product.unit} of ${product.name} added to cart`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 flex justify-center">
      <Card className="w-full max-w-5xl bg-white shadow-md rounded-2xl overflow-hidden flex flex-col md:flex-row">
        {/* Product Image */}
        <div className="md:w-1/2 bg-gray-100 flex items-center justify-center p-6">
          <img
            src={product.image}
            alt={product.name}
            className="max-h-96 object-contain rounded-lg"
          />
        </div>

        {/* Product Info */}
        <CardContent className="md:w-1/2 p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <h1 className="text-2xl font-semibold text-gray-800">{product.name}</h1>
              <Button variant="ghost" className="text-gray-600 hover:text-red-500">
                <Heart size={22} />
              </Button>
            </div>
            <p className="text-sm text-blue-600 font-medium mt-1">
              Category: {product.category}
            </p>

            <div className="flex items-center gap-2 mt-3">
              <Star className="text-yellow-400 fill-yellow-400" size={18} />
              <span className="text-gray-700 font-medium">{product.rating} / 5</span>
            </div>

            {/* Price */}
            <div className="mt-4 flex items-center gap-3">
              <span className="text-2xl font-bold text-green-700">
                ₹{discountedPrice.toFixed(2)}
              </span>
              <span className="text-gray-400 line-through text-sm">
                ₹{product.price}
              </span>
              <span className="text-sm text-green-600 font-medium">
                {product.discount}% off
              </span>
            </div>

            {/* Description */}
            <p className="text-gray-600 mt-4 leading-relaxed text-sm">
              {product.description}
            </p>

            {/* Quantity Selector */}
            <div className="mt-6 flex items-center gap-4">
              <p className="font-medium text-gray-700">Quantity:</p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDecrease}
                  className="rounded-full"
                >
                  -
                </Button>
                <span className="px-3 font-semibold">{quantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleIncrease}
                  className="rounded-full"
                >
                  +
                </Button>
                <span className="text-sm text-gray-500 ml-2">
                  {product.type === 'liquid' ? 'ml' : 'pcs'}
                </span>
              </div>
            </div>

            {/* Pincode check */}
            <div className="mt-6 flex items-center gap-2">
              <Truck size={18} className="text-blue-600" />
              <input
                type="text"
                placeholder="Enter delivery pincode"
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-40"
                value={pincode}
                onChange={e => setPincode(e.target.value)}
              />
              <Button variant="outline" size="sm">
                Check
              </Button>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleAddToCart}
              className="bg-blue-600 hover:bg-blue-700 text-white flex-1 flex items-center justify-center gap-2"
            >
              <ShoppingBag size={18} /> Add to Cart
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              Buy Now
            </Button>
          </div>

          {/* Total */}
          <div className="mt-6 text-gray-700 text-sm">
            Total: <span className="font-semibold text-lg">₹{total.toFixed(2)}</span>
          </div>

          {/* Stock Info */}
          <p className="text-sm text-gray-500 mt-1">
            {product.stock > 0 ? (
              <span className="text-green-600">In stock</span>
            ) : (
              <span className="text-red-500">Out of stock</span>
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
