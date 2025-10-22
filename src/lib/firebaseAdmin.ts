// lib/firebaseAdmin.ts
import { getApps, initializeApp, cert, applicationDefault, App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// ✅ Read project config (public first, then private)
const projectId =
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
  process.env.FIREBASE_PROJECT_ID ||
  process.env.GOOGLE_CLOUD_PROJECT;

const clientEmail =
  process.env.NEXT_PUBLIC_FIREBASE_CLIENT_EMAIL ||
  process.env.FIREBASE_CLIENT_EMAIL;

const rawPrivateKey =
  process.env.NEXT_PUBLIC_FIREBASE_PRIVATE_KEY ||
  process.env.FIREBASE_PRIVATE_KEY;

// ✅ Normalize key format
const privateKey = rawPrivateKey ? rawPrivateKey.replace(/\\n/g, "\n") : undefined;

// ✅ Ensure everything is defined
if (!projectId) {
  throw new Error(
    "❌ Missing FIREBASE_PROJECT_ID (or NEXT_PUBLIC_FIREBASE_PROJECT_ID) in environment variables."
  );
}

let app: App;

// ✅ Initialize Admin SDK only once
if (!getApps().length) {
  app = initializeApp({
    credential:
      clientEmail && privateKey
        ? cert({
            projectId,
            clientEmail,
            privateKey,
          })
        : applicationDefault(),
    projectId,
  });
} else {
  app = getApps()[0]!;
}

// ✅ Initialize Firestore (no settings() needed)
export const adminDb = getFirestore(app);
