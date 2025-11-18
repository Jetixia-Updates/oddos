import React from "react";
import { Store } from "lucide-react";
import ModulePlaceholder from "@/components/ModulePlaceholder";

export default function ECommerce() {
  const features = [
    "Product Catalog",
    "Shopping Cart",
    "Order Management",
    "Payment Gateway Integration",
    "Shipping Integration",
    "Customer Reviews",
    "Wish List",
    "Promotions & Discounts",
    "Order Tracking",
    "Analytics & Reports",
  ];

  return (
    <ModulePlaceholder
      title="E-Commerce Module"
      description="Online store with product catalog, shopping cart, and order management"
      icon={<Store className="w-8 h-8 text-purple-500" />}
      features={features}
    />
  );
}
