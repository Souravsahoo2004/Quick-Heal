'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Plus, Edit, Trash2, Navigation, CheckCircle, ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useCart } from '@/contexts/CartContext';
import { useMutation, useQuery } from 'convex/react';
import { api } from 'convex/_generated/api';
import { Id } from 'convex/_generated/dataModel';

interface LocationCoords {
  latitude: number;
  longitude: number;
}

interface ConvexAddress {
  _id: Id<"addresses">;
  _creationTime: number;
  userId: string;
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
  latitude?: number;
  longitude?: number;
  locationType?: "manual" | "auto";
  createdAt: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, getSubtotal } = useCart();

  const [selectedAddress, setSelectedAddress] = useState<Id<"addresses"> | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationCoords | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Convex hooks
  const addresses = useQuery(
    api.addresses.getUserAddresses,
    userId ? { userId } : "skip"
  );
  const addAddressMutation = useMutation(api.addresses.addAddress);
  const deleteAddressMutation = useMutation(api.addresses.deleteAddress);
  const setDefaultMutation = useMutation(api.addresses.setDefaultAddress);

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

  // Show location modal if no addresses exist
  useEffect(() => {
    if (addresses !== undefined) {
      if (addresses.length === 0) {
        setShowLocationModal(true);
      } else {
        const defaultAddr = addresses.find(addr => addr.isDefault);
        if (defaultAddr) {
          setSelectedAddress(defaultAddr._id);
        } else if (addresses.length > 0) {
          setSelectedAddress(addresses[0]._id);
        }
      }
    }
  }, [addresses]);

  const requestLocation = () => {
    setIsLoadingLocation(true);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ latitude, longitude });
          setIsLoadingLocation(false);
          setShowLocationModal(false);
          setShowAddForm(true);
        },
        (error) => {
          console.error('Error getting location:', error);
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
      setIsLoadingLocation(false);
      setShowLocationModal(false);
      setShowAddForm(true);
    }
  };

  const addAddress = async (newAddress: {
    name: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    isDefault: boolean;
  }) => {
    if (!userId) {
      alert('Please log in to add an address');
      return;
    }

    try {
      const addressId = await addAddressMutation({
        userId,
        name: newAddress.name,
        phone: newAddress.phone,
        addressLine1: newAddress.addressLine1,
        addressLine2: newAddress.addressLine2,
        city: newAddress.city,
        state: newAddress.state,
        pincode: newAddress.pincode,
        isDefault: newAddress.isDefault || (addresses?.length === 0),
        latitude: currentLocation?.latitude,
        longitude: currentLocation?.longitude,
      });

      setSelectedAddress(addressId as Id<"addresses">);
      setShowAddForm(false);
      setCurrentLocation(null);
    } catch (error) {
      console.error('Error adding address:', error);
      alert('Failed to add address. Please try again.');
    }
  };

  const deleteAddress = async (addressId: Id<"addresses">) => {
    try {
      await deleteAddressMutation({ addressId });

      if (selectedAddress === addressId && addresses && addresses.length > 1) {
        const remainingAddresses = addresses.filter(addr => addr._id !== addressId);
        if (remainingAddresses.length > 0) {
          setSelectedAddress(remainingAddresses[0]._id);
        } else {
          setSelectedAddress(null);
        }
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      alert('Failed to delete address. Please try again.');
    }
  };

  const setDefaultAddress = async (addressId: Id<"addresses">) => {
    if (!userId) return;

    try {
      await setDefaultMutation({ addressId, userId });
      setSelectedAddress(addressId);
    } catch (error) {
      console.error('Error setting default address:', error);
      alert('Failed to set default address. Please try again.');
    }
  };

  const calculateTotal = () => getSubtotal();

  if (addresses === undefined) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading addresses...</p>
        </div>
      </div>
    );
  }

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
          onCancel={() => {
            setShowAddForm(false);
            setCurrentLocation(null);
          }}
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
                  key={address._id}
                  address={address}
                  isSelected={selectedAddress === address._id}
                  onSelect={() => setSelectedAddress(address._id)}
                  onSetDefault={() => setDefaultAddress(address._id)}
                  onDelete={() => deleteAddress(address._id)}
                />
              ))
            )}
          </CardContent>

          {addresses.length > 0 && selectedAddress && (
            <CardFooter>
              {cartItems.length === 0 ? (
                <Button disabled className="w-full bg-gray-400 text-white cursor-not-allowed">
                  Cart is Empty
                </Button>
              ) : (
                <a
                  href="/Orders"
                  onClick={(e) => {
                    if (!selectedAddress) {
                      e.preventDefault();
                      alert('Please select a delivery address');
                      return;
                    }
                    if (!userId || !userEmail) {
                      e.preventDefault();
                      alert('Please log in to place an order');
                      window.location.href = '/login';
                      return;
                    }
                    if (cartItems.length === 0) {
                      e.preventDefault();
                      alert('Your cart is empty');
                      return;
                    }
                    localStorage.setItem('selectedAddressId', selectedAddress.toString());
                  }}
                  className="block w-full"
                >
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                    Proceed to Order (₹{calculateTotal().toFixed(2)})
                  </Button>
                </a>
              )}
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

interface AddressCardProps {
  address: ConvexAddress;
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
            {address.locationType && (
              <span className={`text-xs px-2 py-1 rounded ${
                address.locationType === 'auto' 
                  ? 'bg-purple-100 text-purple-600' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {address.locationType === 'auto' ? '📍 Auto' : '✏️ Manual'}
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
          {address.latitude && address.longitude && (
            <p className="text-xs text-gray-400 mt-1">
              📍 GPS: {address.latitude.toFixed(4)}, {address.longitude.toFixed(4)}
            </p>
          )}
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
              if (confirm('Are you sure you want to delete this address?')) {
                onDelete();
              }
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

interface AddressFormProps {
  onAdd: (address: {
    name: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    isDefault: boolean;
  }) => void;
  onCancel: () => void;
  currentLocation?: LocationCoords | null;
}

function AddressForm({ onAdd, onCancel, currentLocation }: AddressFormProps) {
  const [formData, setFormData] = React.useState({
    name: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false,
  });
  const [isLoadingLocation, setIsLoadingLocation] = React.useState(false);

  React.useEffect(() => {
    if (currentLocation) {
      setFormData((prev) => ({
        ...prev,
        addressLine1: `Lat: ${currentLocation.latitude.toFixed(
          4
        )}, Lng: ${currentLocation.longitude.toFixed(4)}`,
        city: 'Auto-detected City',
        state: 'Auto-detected State',
        pincode: '000000',
      }));
    }
  }, [currentLocation]);

  const useCurrentLocation = () => {
    setIsLoadingLocation(true);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setIsLoadingLocation(false);

          setFormData((prev) => ({
            ...prev,
            addressLine1: `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`,
            city: 'Auto-detected City',
            state: 'Auto-detected State',
            pincode: '000000',
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
          maximumAge: 10000,
        }
      );
    } else {
      setIsLoadingLocation(false);
      alert('Geolocation is not supported by this browser.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      formData.name &&
      formData.phone &&
      formData.addressLine1 &&
      formData.city &&
      formData.state &&
      formData.pincode
    ) {
      onAdd({
        ...formData,
        addressLine2: formData.addressLine2 || undefined,
      });
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
            {!currentLocation && (
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
            )}
            {currentLocation && (
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <p className="text-sm text-green-700">
                  ✓ Location captured: {currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)}
                </p>
              </div>
            )}
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
