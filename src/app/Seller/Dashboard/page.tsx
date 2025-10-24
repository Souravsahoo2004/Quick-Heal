"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Navbar from "../_Components/navbar";// adjust to your path

const DashboardPage = () => {
  const pathname = usePathname();
  const pageName = pathname.split("/").pop()?.toLowerCase() || "dashboard";

  const renderContent = () => {
    switch (pageName) {
      case "management":
        return <div>Management page content.</div>;
      case "orders":
        return <div>Orders page content.</div>;
      case "products":
        return <div>Products page content.</div>;
      case "customers":
        return <div>Customers page content.</div>;
      default:
        return <div>Welcome to your Ecommerce Dashboard!</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Add padding top same as navbar height (e.g. 64px) */}
      <main className="p-6 pt-16 bg-white">
        <h2 className="text-xl font-semibold mb-4 capitalize">{pageName} Overview</h2>
        {renderContent()}
      </main>
    </div>
  );
};

export default DashboardPage;
