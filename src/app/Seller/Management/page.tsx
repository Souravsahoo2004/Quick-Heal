"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { X, Upload, Plus, Trash2, Edit } from "lucide-react";

interface ProductFormData {
  productName: string;
  description: string;
  price: string;
  discountedPrice: string;
  rating: string;
  offers: string;
  highlightedFeatures: string[];
}

const ManagementPage: React.FC = () => {
  const [adminUid, setAdminUid] = useState<string | null>(null);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState<Id<"products"> | null>(null);

  // Form state
  const [formData, setFormData] = useState<ProductFormData>({
    productName: "",
    description: "",
    price: "",
    discountedPrice: "",
    rating: "",
    offers: "",
    highlightedFeatures: [""],
  });

  // Image upload states
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  // Convex mutations and queries
  const generateUploadUrl = useMutation(api.products.generateUploadUrl);
  const createProduct = useMutation(api.products.createProduct);
  const updateProduct = useMutation(api.products.updateProduct);
  const deleteProduct = useMutation(api.products.deleteProduct);
  
  const products = useQuery(
    api.products.getProductsByAdmin,
    adminUid ? { adminUid } : "skip"
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAdminUid(user.uid);
        setAdminEmail(user.email);
      } else {
        setAdminUid(null);
        setAdminEmail(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...formData.highlightedFeatures];
    newFeatures[index] = value;
    setFormData((prev) => ({ ...prev, highlightedFeatures: newFeatures }));
  };

  const addFeatureField = () => {
    setFormData((prev) => ({
      ...prev,
      highlightedFeatures: [...prev.highlightedFeatures, ""],
    }));
  };

  const removeFeatureField = (index: number) => {
    const newFeatures = formData.highlightedFeatures.filter(
      (_, i) => i !== index
    );
    setFormData((prev) => ({ ...prev, highlightedFeatures: newFeatures }));
  };

  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;

    // Validate files
    const validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        alert(`${file.name} is not an image file`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is larger than 5MB`);
        return false;
      }
      return true;
    });

    setImageFiles((prev) => [...prev, ...validFiles]);

    // Create previews
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setFormData({
      productName: "",
      description: "",
      price: "",
      discountedPrice: "",
      rating: "",
      offers: "",
      highlightedFeatures: [""],
    });
    setImageFiles([]);
    setImagePreviews([]);
    setEditingProductId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!adminUid || !adminEmail) {
      alert("You must be logged in to create products");
      return;
    }

    if (imageFiles.length === 0) {
      alert("Please upload at least one product image");
      return;
    }

    setUploading(true);

    try {
      // Upload all images
      const imageStorageIds: Id<"_storage">[] = [];

      for (const file of imageFiles) {
        const postUrl = await generateUploadUrl();
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        const { storageId } = await result.json();
        imageStorageIds.push(storageId as Id<"_storage">);
      }

      // Filter out empty features
      const filteredFeatures = formData.highlightedFeatures.filter(
        (f) => f.trim() !== ""
      );

      const productData = {
        productName: formData.productName,
        description: formData.description,
        price: parseFloat(formData.price),
        discountedPrice: formData.discountedPrice
          ? parseFloat(formData.discountedPrice)
          : undefined,
        rating: formData.rating ? parseFloat(formData.rating) : undefined,
        offers: formData.offers || undefined,
        highlightedFeatures: filteredFeatures,
        imageStorageIds,
      };

      if (editingProductId) {
        await updateProduct({
          productId: editingProductId,
          ...productData,
        });
        alert("Product updated successfully!");
      } else {
        await createProduct({
          adminUid,
          adminEmail,
          ...productData,
        });
        alert("Product created successfully!");
      }

      resetForm();
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Failed to save product");
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (product: any) => {
    setFormData({
      productName: product.productName,
      description: product.description,
      price: product.price.toString(),
      discountedPrice: product.discountedPrice?.toString() || "",
      rating: product.rating?.toString() || "",
      offers: product.offers || "",
      highlightedFeatures: product.highlightedFeatures.length > 0 
        ? product.highlightedFeatures 
        : [""],
    });
    setEditingProductId(product._id);
    setShowForm(true);
  };

  const handleDelete = async (productId: Id<"products">) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct({ productId });
        alert("Product deleted successfully!");
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Failed to delete product");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 mt-20">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <Plus size={20} />
            {showForm ? "Cancel" : "Add New Product"}
          </button>
        </div>

        {/* Product Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-6">
              {editingProductId ? "Edit Product" : "Add New Product"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="productName"
                  value={formData.productName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter product name"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter product description"
                />
              </div>

              {/* Price and Discounted Price */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discounted Price
                  </label>
                  <input
                    type="number"
                    name="discountedPrice"
                    value={formData.discountedPrice}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Rating and Offers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating (0-5)
                  </label>
                  <input
                    type="number"
                    name="rating"
                    value={formData.rating}
                    onChange={handleInputChange}
                    step="0.1"
                    min="0"
                    max="5"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="4.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Offers
                  </label>
                  <input
                    type="text"
                    name="offers"
                    value={formData.offers}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., Buy 2 Get 1 Free"
                  />
                </div>
              </div>

              {/* Highlighted Features */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Highlighted Features
                  </label>
                  <button
                    type="button"
                    onClick={addFeatureField}
                    className="text-green-600 hover:text-green-700 text-sm font-medium"
                  >
                    + Add Feature
                  </button>
                </div>

                {formData.highlightedFeatures.map((feature, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => handleFeatureChange(index, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder={`Feature ${index + 1}`}
                    />
                    {formData.highlightedFeatures.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFeatureField(index)}
                        className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                      >
                        <X size={20} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Images * (Max 5MB each)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    id="product-images"
                  />
                  <label
                    htmlFor="product-images"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Upload className="w-12 h-12 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">
                      Click to upload images or drag and drop
                    </span>
                  </label>
                </div>

                {/* Image Previews */}
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {uploading ? "Uploading..." : editingProductId ? "Update Product" : "Create Product"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Products List */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-6">Your Products</h2>

          {!products || products.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No products yet. Click "Add New Product" to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition"
                >
                  {/* Product Image */}
                  <div className="relative h-48 bg-gray-100">
                    {product.imageUrls && product.imageUrls.length > 0 ? (
                      <img
                        src={product.imageUrls[0]}
                        alt={product.productName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {product.productName}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {product.description}
                    </p>

                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg font-bold text-green-600">
                        ${product.discountedPrice || product.price}
                      </span>
                      {product.discountedPrice && (
                        <span className="text-sm text-gray-400 line-through">
                          ${product.price}
                        </span>
                      )}
                      {product.rating && (
                        <span className="ml-auto text-sm text-yellow-600">
                          ⭐ {product.rating}
                        </span>
                      )}
                    </div>

                    {product.offers && (
                      <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded mb-3">
                        {product.offers}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                      >
                        <Edit size={16} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagementPage;
