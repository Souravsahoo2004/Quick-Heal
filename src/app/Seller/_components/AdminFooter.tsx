"use client";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import { MdEmail, MdLocationOn, MdPhone } from "react-icons/md";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative bg-[#f9fbfd] border-t border-gray-200 overflow-hidden">
      {/* Gradient Glow */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#c9efff] via-[#f9fbfd] to-transparent opacity-70 pointer-events-none"></div>

      {/* Footer Container */}
      <div className="relative max-w-7xl mx-auto px-6 md:px-12 py-20 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 z-10">
        {/* Brand Info */}
        <div>
          <h2 className="text-2xl font-bold text-[#008FC8] mb-4">Quick Heal</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            Empowering healthcare with trust, technology, and timely delivery.  
            Get medicines, consultations, and wellness — all in one place.
          </p>
          <div className="flex gap-3">
            {[
              { icon: <FaFacebookF />, link: "https://www.facebook.com/share/1aWfHurwf4/"},
              { icon: <FaTwitter />, link: "https://www.instagram.com/souravsahoo137?igsh=czlpZHR4aTRvdzgz" },
              { icon: <FaInstagram />, link: "https://x.com/Sourav_sahoo3" },
              { icon: <FaLinkedinIn />, link: "https://www.linkedin.com/in/sourav-sahoo7?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" },
            ].map((social, i) => (
              <a
                key={i}
                href={social.link}
                className="p-2.5 bg-white shadow-md rounded-full text-[#008FC8] hover:bg-[#008FC8] hover:text-white transition transform hover:-translate-y-1"
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Explore */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 relative after:content-[''] after:block after:w-10 after:h-1 after:bg-[#008FC8] after:rounded-full after:mt-1">
            Explore
          </h3>
          <ul className="space-y-3 text-gray-600">
            <li><Link href="/Seller/Dashboard" className="hover:text-[#008FC8] transition">DashBoard</Link></li>
            <li><Link href="/Seller/Management" className="hover:text-[#008FC8] transition">Management</Link></li>
            <li><Link href="/Seller/Admin_OrdersDoctors" className="hover:text-[#008FC8] transition">Orders</Link></li>
           
          </ul>
        </div>

        {/* Services */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 relative after:content-[''] after:block after:w-10 after:h-1 after:bg-[#008FC8] after:rounded-full after:mt-1">
            Services
          </h3>
          <ul className="space-y-3 text-gray-600">
            <li>Online Medicine Delivery</li>
            <li>Doctor Appointment Booking</li>
            
            <li>24/7 Customer Support</li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 relative after:content-[''] after:block after:w-10 after:h-1 after:bg-[#008FC8] after:rounded-full after:mt-1">
            Contact
          </h3>
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-center gap-2"><MdLocationOn className="text-[#008FC8]" /> Bhubaneswar, Odisha, India</li>
            <li className="flex items-center gap-2"><MdEmail className="text-[#008FC8]" /> support@quickheal.com</li>
            <li className="flex items-center gap-2"><MdPhone className="text-[#008FC8]" /> +91 7205129310</li>
          </ul>
        </div>
      </div>

      {/* Divider */}
      <div className="relative border-t border-gray-200"></div>

      {/* Bottom Bar */}
      <div className="relative flex flex-col md:flex-row items-center justify-between text-center md:text-left max-w-7xl mx-auto px-6 md:px-12 py-6 text-gray-500 text-sm z-10">
        <p>
          © {new Date().getFullYear()} <span className="text-[#008FC8] font-semibold">Quick Heal</span>. All rights reserved.
        </p>
        <div className="flex gap-4 mt-3 md:mt-0">
          <Link href="/Terms&Cond" className="hover:text-[#008FC8] transition">Privacy Policy</Link>
          <Link href="/Terms&Cond" className="hover:text-[#008FC8] transition">Terms of Service</Link>
        </div>
      </div>

      {/* Subtle Glow Line */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#008FC8] via-[#00B6D3] to-[#6BE5FF] blur-md opacity-60"></div>
    </footer>
  );
}
