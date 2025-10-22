// src/app/(Public)/TrackOrder/[orderId]/page.tsx
'use client';

import React, { useEffect, useState, ReactElement } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Package, Truck, CheckCircle, Clock } from 'lucide-react';
import { auth, firestore } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface OrderStatus {
  stage: string;
  description: string;
  completed: boolean;
  icon: ReactElement;
}

const iconFor = (stage: string): ReactElement => {
  if (stage === 'Order Placed') return <Package className="text-green-600 w-6 h-6" />;
  if (stage === 'Shipped') return <Truck className="text-green-600 w-6 h-6" />;
  if (stage === 'Out for Delivery') return <Clock className="text-yellow-500 w-6 h-6" />;
  return <CheckCircle className="text-gray-400 w-6 h-6" />;
};

export default function TrackOrderPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const router = useRouter();
  const [trackingData, setTrackingData] = useState<OrderStatus[] | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const run = async () => {
      setError('');
      setTrackingData(null);
      if (!orderId) {
        setError('Missing orderId in URL');
        return;
      }
      const user = auth.currentUser;
      if (!user) {
        router.push('/sign-in');
        return;
      }
      try {
        const ref = doc(firestore, 'users', user.uid, 'orders', orderId);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          setError('Order not found');
          return;
        }
        const data = snap.data() as any;
        const steps = (data.tracking ?? []).map((s: any) => ({
          stage: s.stage,
          description: s.description,
          completed: !!s.completed,
          icon: iconFor(s.stage),
        }));
        setTrackingData(steps);
      } catch (e: any) {
        setError(e?.message || 'Failed to load tracking');
      }
    };
    run();
  }, [orderId, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-20 px-4 bg-gradient-to-b from-white to-gray-50">
      <Card className="w-full max-w-2xl shadow-xl rounded-2xl border border-gray-200 p-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-gray-800 mb-4">
            Track Your Order
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-500 text-center mb-3 font-medium">{error}</p>}
          {trackingData && (
            <div className="space-y-6 mt-6">
              {trackingData.map((step, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-4 p-4 rounded-xl border ${
                    step.completed ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'
                  }`}
                >
                  {step.icon}
                  <div>
                    <p className={`font-semibold ${step.completed ? 'text-green-700' : 'text-gray-700'}`}>
                      {step.stage}
                    </p>
                    <p className="text-sm text-gray-600">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
