"use client";

import React from "react";

export default function TermsAndPrivacyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-white text-gray-800 py-16 px-6 md:px-20">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            Terms & Privacy Policy
          </h1>
          <p className="text-gray-500 text-lg">
            Last updated on <span className="font-medium">October 30, 2025</span>
          </p>
        </header>

        {/* Terms of Service Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            1. Terms of Service
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            By accessing or using our platform, you agree to comply with these Terms of Service.
            If you disagree with any part of the terms, you may not access the service.
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>You must be at least 18 years old to use this service.</li>
            <li>You are responsible for maintaining the confidentiality of your account.</li>
            <li>
              We reserve the right to modify or terminate our services at any time without prior notice.
            </li>
            <li>
              All content, trademarks, and intellectual property belong to the respective owners.
            </li>
          </ul>
        </section>

        {/* Privacy Policy Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            2. Privacy Policy
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Your privacy is important to us. This Privacy Policy explains how we collect, use,
            and protect your personal information when you use our platform.
          </p>

          <h3 className="text-xl font-semibold mb-2">Information We Collect</h3>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
            <li>Personal information such as name, email, and phone number.</li>
            <li>Usage data such as browser type, device information, and IP address.</li>
            <li>Cookies to improve user experience and analytics.</li>
          </ul>

          <h3 className="text-xl font-semibold mb-2">How We Use Your Data</h3>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
            <li>To provide and maintain our services.</li>
            <li>To improve user experience and customer support.</li>
            <li>To communicate with you about updates, offers, and policies.</li>
          </ul>

          <h3 className="text-xl font-semibold mb-2">Data Protection</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            We implement appropriate technical and organizational security measures to protect
            your data against unauthorized access, alteration, disclosure, or destruction.
          </p>
        </section>

        {/* Cookie Policy Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            3. Cookie Policy
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We use cookies to enhance your experience, analyze site traffic, and understand
            user behavior. You can disable cookies in your browser settings at any time.
          </p>
        </section>

        {/* Contact Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            4. Contact Us
          </h2>
          <p className="text-gray-700 leading-relaxed">
            If you have any questions or concerns about our Terms or Privacy Policy, feel free to
            contact us at{" "}
            <a
              href="mailto:support@quickheal.com"
              className="text-blue-600 hover:underline font-medium"
            >
              support@quickheal.com
            </a>.
          </p>
        </section>

        {/* Footer */}
        <footer className="text-center mt-16 text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} Quick Heal. All rights reserved.
        </footer>
      </div>
    </main>
  );
}
