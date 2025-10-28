// src/app/(Public)/Checkout/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Plus, Edit, Trash2, Navigation, CheckCircle, ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useCart } from '@/contexts/CartContext'; // ✅ Use CartContext instead of Convex
import type { CartItem, Address } from '@/types/cart';

interface LocationCoords {
  latitude: number;
  longitude: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, getSubtotal } = useCart(); // ✅ Get cart from context
  
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationPermission, setLocationPermission] = useState<'pending' | 'granted' | 'denied'>('pending');
  const [currentLocation, setCurrentLocation] = useState<LocationCoords | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Firebase auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        setUserEmail(user.email);
      } else {
        setUserId(null);
        setUserEmail(null);
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Load addresses from localStorage
  useEffect(() => {
    const savedAddresses = localStorage.getItem('userAddresses');
    if (savedAddresses) {
      const parsedAddresses = JSON.parse(savedAddresses);
      setAddresses(parsedAddresses);
      
      const defaultAddress = parsedAddresses.find((addr: Address) => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress.id);
      }
    } else {
      setShowLocationModal(true);
    }
  }, []);

  const requestLocation = () => {
    setIsLoadingLocation(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ latitude, longitude });
          setLocationPermission('granted');
          setIsLoadingLocation(false);
          setShowLocationModal(false);
          setShowAddForm(true);
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocationPermission('denied');
          setIsLoadingLocation(false);
          setShowLocationModal(false);
          setShowAddForm(true);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000
        }
      );
    } else {
      setLocationPermission('denied');
      setIsLoadingLocation(false);
      setShowLocationModal(false);
      setShowAddForm(true);
    }
  };

  const saveAddresses = (newAddresses: Address[]) => {
    setAddresses(newAddresses);
    localStorage.setItem('userAddresses', JSON.stringify(newAddresses));
  };

  const addAddress = (newAddress: Omit<Address, 'id'>) => {
    const addressWithId = {
      ...newAddress,
      id: Date.now().toString()
    };
    
    const updatedAddresses = [...addresses, addressWithId];
    saveAddresses(updatedAddresses);
    
    if (addressWithId.isDefault || addresses.length === 0) {
      setSelectedAddress(addressWithId.id);
    }
    
    setShowAddForm(false);
  };

  const deleteAddress = (addressId: string) => {
    const updatedAddresses = addresses.filter(addr => addr.id !== addressId);
    saveAddresses(updatedAddresses);
    
    if (selectedAddress === addressId) {
      setSelectedAddress(updatedAddresses.length > 0 ? updatedAddresses[0].id : null);
    }
  };

  const setDefaultAddress = (addressId: string) => {
    const updatedAddresses = addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === addressId
    }));
    saveAddresses(updatedAddresses);
    setSelectedAddress(addressId);
  };

  const calculateTotal = () => {
    return getSubtotal(); // ✅ Use getSubtotal from context
  };

  // ✅ Save address to localStorage and proceed to Orders page
  const proceedToOrder = () => {
    if (!selectedAddress) {
      alert('Please select a delivery address');
      return;
    }

    if (!userId || !userEmail) {
      alert('Please log in to place an order');
      router.push('/login');
      return;
    }

    if (cartItems.length === 0) {
      alert('Your cart is empty');
      return;
    }

    // Save selected address ID to localStorage for Orders page
    localStorage.setItem('selectedAddressId', selectedAddress);
    
    // Navigate to Orders page for final confirmation
    router.push('/Orders');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
      {showLocationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <MapPin className="text-blue-500" />
                Welcome! Set Your First Address
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 text-sm">
                To get started with deliveries, we need to know where to send your orders.
              </p>
              <div className="space-y-3">
                <Button
                  onClick={requestLocation}
                  disabled={isLoadingLocation}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  {isLoadingLocation ? 'Getting Location...' : 'Use Current Location'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowLocationModal(false);
                    setShowAddForm(true);
                  }}
                  className="w-full"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Enter Address Manually
                </Button>
              </div>
              <p className="text-xs text-gray-500 text-center">
                You can always add more addresses later
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {showAddForm && (
        <AddressForm 
          onAdd={addAddress} 
          onCancel={() => setShowAddForm(false)}
          currentLocation={currentLocation}
        />
      )}

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-md rounded-2xl bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <MapPin className="text-blue-500" />
                Select Delivery Address
              </h2>
              <Button
                variant="outline"
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2"
              >
                <Plus size={16} />
                Add Address
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {addresses.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MapPin className="mx-auto mb-3 text-gray-400" size={40} />
                <p>No delivery addresses found</p>
                <p className="text-sm mt-1">Add an address to continue</p>
              </div>
            ) : (
              addresses.map((address) => (
                <AddressCard
                  key={address.id}
                  address={address}
                  isSelected={selectedAddress === address.id}
                  onSelect={() => setSelectedAddress(address.id)}
                  onSetDefault={() => setDefaultAddress(address.id)}
                  onDelete={() => deleteAddress(address.id)}
                />
              ))
            )}
          </CardContent>

          {addresses.length > 0 && selectedAddress && (
            <CardFooter>
              <Button
                onClick={proceedToOrder}
                disabled={isPlacingOrder || cartItems.length === 0} // ✅ Fixed: cartItems is always defined
                className="w-full bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
              >
                {cartItems.length === 0 ? 'Cart is Empty' : `Proceed to Order (₹${calculateTotal().toFixed(2)})`}
              </Button>
            </CardFooter>
          )}
        </Card>

        {/* Order Summary Section */}
        <Card className="shadow-md rounded-2xl bg-white h-fit sticky top-4">
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <ShoppingCart className="text-green-600" />
              Order Summary
            </h3>
          </CardHeader>
          <CardContent className="space-y-4">
            {cartItems.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <ShoppingCart className="mx-auto mb-2 text-gray-400" size={32} />
                <p className="text-sm">Your cart is empty</p>
                <Button
                  variant="outline"
                  onClick={() => router.push('/Products')}
                  className="mt-4"
                >
                  Browse Products
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-2 border rounded-lg">
                      <img
                        src={item.img}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-800 line-clamp-1">
                          {item.name}
                        </h4>
                        <p className="text-xs text-gray-500">Qty: {item.qty}</p>
                        <p className="text-sm font-semibold text-green-600">
                          ₹{(item.price * item.qty).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">₹{calculateTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Delivery</span>
                    <span className="font-medium text-green-600">FREE</span>
                  </div>
                  <div className="flex justify-between text-base font-bold border-t pt-2">
                    <span>Total</span>
                    <span className="text-green-600">₹{calculateTotal().toFixed(2)}</span>
                  </div>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg text-center">
                  <p className="text-sm text-blue-700">
                    {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Address Card Component (unchanged)
interface AddressCardProps {
  address: Address;
  isSelected: boolean;
  onSelect: () => void;
  onSetDefault: () => void;
  onDelete: () => void;
}

function AddressCard({ address, isSelected, onSelect, onSetDefault, onDelete }: AddressCardProps) {
  return (
    <div
      className={`border rounded-lg p-4 cursor-pointer transition-all ${
        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-medium text-gray-800">{address.name}</h3>
            {address.isDefault && (
              <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
                Default
              </span>
            )}
            {isSelected && <CheckCircle className="text-blue-500 w-4 h-4" />}
          </div>
          <p className="text-sm text-gray-600">{address.phone}</p>
          <p className="text-sm text-gray-600 mt-1">
            {address.addressLine1}
            {address.addressLine2 && `, ${address.addressLine2}`}
          </p>
          <p className="text-sm text-gray-600">
            {address.city}, {address.state} - {address.pincode}
          </p>
        </div>
        
        <div className="flex gap-2 ml-4">
          {!address.isDefault && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onSetDefault();
              }}
              className="text-blue-600 hover:text-blue-700"
            >
              Set Default
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Address Form Component (unchanged)
interface AddressFormProps {
  onAdd: (address: Omit<Address, 'id'>) => void;
  onCancel: () => void;
  currentLocation?: LocationCoords | null;
}

function AddressForm({ onAdd, onCancel, currentLocation }: AddressFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false
  });
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const useCurrentLocation = () => {
    setIsLoadingLocation(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setIsLoadingLocation(false);
          
          setFormData(prev => ({
            ...prev,
            addressLine1: `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`,
            city: 'Auto-detected City',
            state: 'Auto-detected State',
            pincode: '000000'
          }));
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsLoadingLocation(false);
          alert('Unable to get your location. Please enter your address manually.');
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000
        }
      );
    } else {
      setIsLoadingLocation(false);
      alert('Geolocation is not supported by this browser.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.phone && formData.addressLine1 && formData.city && formData.state && formData.pincode) {
      onAdd(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <h3 className="text-lg font-semibold">Add New Address</h3>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700 mb-2">Quick fill with location:</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={useCurrentLocation}
                disabled={isLoadingLocation}
                className="w-full"
              >
                <Navigation className="w-4 h-4 mr-2" />
                {isLoadingLocation ? 'Getting Location...' : 'Use Current Location'}
              </Button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter full name"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Enter phone number"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1 *</label>
              <Input
                value={formData.addressLine1}
                onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                placeholder="House No, Building, Street"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
              <Input
                value={formData.addressLine2}
                onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                placeholder="Area, Landmark (Optional)"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                <Input
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="City"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                <Input
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="State"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
              <Input
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                placeholder="Enter pincode"
                pattern="[0-9]{6}"
                maxLength={6}
                required
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isDefault"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                className="mr-2"
              />
              <label htmlFor="isDefault" className="text-sm text-gray-700">
                Set as default address
              </label>
            </div>
          </CardContent>
          
          <CardFooter className="flex gap-3">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
              Save Address
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
