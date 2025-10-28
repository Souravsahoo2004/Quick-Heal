"use client";

import React, { useEffect, useState, ChangeEvent } from "react";
import {
  onAuthStateChanged,
  signOut,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { auth, firestore } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";

interface UserProfile {
  uid: string;
  firstName: string;
  lastName: string;
  gender: string;
  email: string;
  photoURL?: string | null;
  photoStorageId?: Id<"_storage">;
}

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [passwordChangeMode, setPasswordChangeMode] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Image upload states
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const router = useRouter();

  // Convex mutations and queries
  const generateUploadUrl = useMutation(api.users.generateUploadUrl);
  const updateProfilePicture = useMutation(api.users.updateProfilePicture);
  const createOrUpdateUser = useMutation(api.users.createOrUpdateUser);

  // Query user data from Convex (for profile picture)
  const convexUser = useQuery(
    api.users.getUserByUid,
    user ? { uid: user.uid } : "skip"
  );

  // Load user data from Firebase Auth and Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          // Get user data from Firestore
          const docRef = doc(firestore, "users", currentUser.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            setUser({
              uid: currentUser.uid,
              firstName: data.firstName || "",
              lastName: data.lastName || "",
              gender: data.gender || "",
              email: data.email || currentUser.email || "",
              photoURL: null, // Will be loaded from Convex
            });
            setNewFirstName(data.firstName || "");
            setNewLastName(data.lastName || "");

            // Sync user to Convex (without photo)
            await createOrUpdateUser({
              uid: currentUser.uid,
              email: data.email || currentUser.email || "",
              firstName: data.firstName || "",
              lastName: data.lastName || "",
              gender: data.gender || "",
            });
          }
        } catch (error) {
          console.error("Error loading user data:", error);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [createOrUpdateUser]);

  // Update profile picture from Convex
  useEffect(() => {
    if (convexUser && user) {
      setUser((prev) =>
        prev
          ? {
              ...prev,
              photoURL: convexUser.photoURL,
              photoStorageId: convexUser.photoStorageId,
            }
          : null
      );
    }
  }, [convexUser]);

  const handleSignOut = async () => {
    await signOut(auth);
    setUser(null);
    router.push("/Verify/login");
  };

  const handleSignIn = () => {
    router.push("/Verify/login");
  };

  const handleNameChange = async () => {
    if (!user) return;
    try {
      // Update in Firestore
      const docRef = doc(firestore, "users", user.uid);
      await updateDoc(docRef, {
        firstName: newFirstName,
        lastName: newLastName,
      });

      // Update in Convex
      await createOrUpdateUser({
        uid: user.uid,
        email: user.email,
        firstName: newFirstName,
        lastName: newLastName,
        gender: user.gender,
      });

      setUser((prev) =>
        prev
          ? { ...prev, firstName: newFirstName, lastName: newLastName }
          : null
      );
      setEditingName(false);
    } catch (error) {
      console.error("Error updating name:", error);
      alert("Failed to update name");
    }
  };

  const reauthenticate = async () => {
    if (!user || !auth.currentUser) return false;
    try {
      const credential = EmailAuthProvider.credential(
        user.email!,
        currentPassword
      );
      await reauthenticateWithCredential(auth.currentUser, credential);
      return true;
    } catch (error) {
      setPasswordError("Current password is incorrect.");
      return false;
    }
  };

  const handlePasswordChange = async () => {
    setPasswordError("");
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }
    const isAuthenticated = await reauthenticate();
    if (!isAuthenticated) return;

    try {
      if (auth.currentUser) {
        await updatePassword(auth.currentUser, newPassword);
        setPasswordChangeMode(false);
        setCurrentPassword("");
        setNewPassword("");
        alert("Password updated successfully.");
      }
    } catch {
      setPasswordError("Failed to update password.");
    }
  };

  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }

      setImageFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async () => {
    if (!imageFile || !user) return;

    setUploading(true);

    try {
      const postUrl = await generateUploadUrl();

      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": imageFile.type },
        body: imageFile,
      });

      const { storageId } = await result.json();

      await updateProfilePicture({
        storageId: storageId as Id<"_storage">,
        userId: user.uid,
      });

      setImageFile(null);
      setImagePreview(null);
      setUploading(false);

      alert("Profile picture updated successfully!");
    } catch (error: any) {
      console.error("Error uploading image:", error);
      alert(`Failed to upload image: ${error.message || "Unknown error"}`);
      setUploading(false);
    }
  };

  const handleCancelImageUpload = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8">
      <div className="w-full max-w-md px-4 flex items-center mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mx-auto">
          Profile
        </h1>
      </div>

      <div className="bg-white shadow rounded-xl w-full max-w-md px-6 py-8 flex flex-col items-center">
        <div className="relative mb-4">
          <img
            className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
            src={imagePreview || user?.photoURL || "/profile.png"}
            alt="Profile"
          />

          {user && !uploading && (
            <label
              htmlFor="profile-image-upload"
              className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 cursor-pointer hover:bg-blue-700 transition"
              title="Change profile picture"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <input
                id="profile-image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </label>
          )}
        </div>

        {imageFile && !uploading && (
          <div className="mb-4 flex gap-2">
            <button
              onClick={handleImageUpload}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Upload Image
            </button>
            <button
              onClick={handleCancelImageUpload}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        )}

        {uploading && (
          <div className="mb-4 w-full">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
            <p className="text-sm text-gray-600 text-center mt-2">
              Uploading...
            </p>
          </div>
        )}

        {user ? (
          <>
            <div className="text-xl font-medium text-gray-900 mb-2">
              {editingName ? (
                <div className="flex space-x-2">
                  <input
                    className="border-b border-gray-300 outline-none px-2 py-1 w-1/2"
                    value={newFirstName}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setNewFirstName(e.target.value)
                    }
                    placeholder="First Name"
                  />
                  <input
                    className="border-b border-gray-300 outline-none px-2 py-1 w-1/2"
                    value={newLastName}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setNewLastName(e.target.value)
                    }
                    placeholder="Last Name"
                  />
                </div>
              ) : (
                `${user?.firstName || "No"} ${user?.lastName || "Name"}`
              )}
            </div>

            {editingName ? (
              <div className="mb-4">
                <button
                  onClick={handleNameChange}
                  className="mr-2 px-4 py-1 rounded bg-green-600 text-white"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditingName(false);
                    setNewFirstName(user?.firstName || "");
                    setNewLastName(user?.lastName || "");
                  }}
                  className="px-4 py-1 rounded bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditingName(true)}
                className="mb-6 text-blue-600 underline"
              >
                Change Name
              </button>
            )}

            <div className="text-gray-500 text-sm mb-6">{user?.email}</div>

            <div className="text-xs font-semibold text-gray-500 mb-2">
              Personal Information
            </div>
            <div className="w-full py-3 flex justify-between items-center border-b border-gray-200">
              <span>Email Address</span>
              <span className="text-sm text-gray-600">{user?.email}</span>
            </div>
            <div className="w-full py-3 flex justify-between items-center border-b border-gray-200">
              <span>Gender</span>
              <span className="text-sm text-gray-600">{user?.gender}</span>
            </div>
            <div className="w-full py-3 flex justify-between items-center mb-4">
              <span>Name</span>
              <span className="text-sm text-gray-600">
                {user?.firstName} {user?.lastName}
              </span>
            </div>

            {passwordChangeMode ? (
              <div className="w-full mb-8">
                <div className="mb-2">
                  <label
                    className="block text-sm font-medium mb-1"
                    htmlFor="currentPassword"
                  >
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    className="border rounded w-full py-2 px-3"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
                <div className="mb-2">
                  <label
                    className="block text-sm font-medium mb-1"
                    htmlFor="newPassword"
                  >
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    className="border rounded w-full py-2 px-3"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                {passwordError && (
                  <p className="text-red-500 text-sm mb-2">{passwordError}</p>
                )}
                <div>
                  <button
                    onClick={handlePasswordChange}
                    className="mr-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Update Password
                  </button>
                  <button
                    onClick={() => {
                      setPasswordChangeMode(false);
                      setPasswordError("");
                      setCurrentPassword("");
                      setNewPassword("");
                    }}
                    className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setPasswordChangeMode(true)}
                className="mb-4 text-blue-600 underline"
              >
                Change Password
              </button>
            )}
          </>
        ) : (
          <p className="text-gray-500 mb-6">You are not signed in.</p>
        )}

        <div className="w-full flex flex-col gap-2">
          {user ? (
            <button
              onClick={handleSignOut}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
            >
              Sign Out
            </button>
          ) : (
            <button
              onClick={handleSignIn}
              className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
            >
              Sign In
            </button>
          )}
          <button
            onClick={() => router.push("/Verify/login")}
            className="w-full py-3 border border-gray-300 rounded-lg text-blue-600 font-semibold hover:bg-gray-50"
          >
            Switch Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
