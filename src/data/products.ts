// src/data/products.ts
export type ProductFull = {
  id: number;
  slug: string;
  name: string;
  price: number;
  oldPrice?: number;
  discount?: number;
  rating: number;
  ratingCount: number;
  reviewCount: number;
  images: string[];
  highlights: string[];
};

// Example catalog; extend as needed
export const PRODUCTS: Record<string, ProductFull> = {
  'oppo-k13x-5g': {
    id: 101,
    slug: 'oppo-k13x-5g',
    name: 'OPPO K13x 5G (Breeze Blue, 128 GB)',
    price: 9499,
    oldPrice: 13499,
    discount: 30,
    rating: 4.5,
    ratingCount: 2134,
    reviewCount: 340,
    images: [
      '/images/oppo-k13x.png',
      '/images/oppo-front.png',
      '/images/oppo-back.png',
      '/images/oppo-side.png',
    ],
    highlights: [
      '8 GB RAM | 128 GB ROM | Expandable up to 1 TB',
      '6.72 inch Full HD+ Display (120Hz Refresh Rate)',
      '6000 mAh Battery | 45W SUPERVOOC Fast Charging',
      '64MP + 8MP Dual Rear Camera | 16MP Front Camera',
      'Qualcomm Snapdragon 6 Gen 1 Processor',
    ],
  },
  // Add more products with same shape...
};

export function getProductBySlug(slug: string) {
  return PRODUCTS[slug] ?? null;
}
