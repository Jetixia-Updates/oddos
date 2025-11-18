import React from "react";
import { Clock } from "lucide-react";
import ModulePlaceholder from "@/components/ModulePlaceholder";

export default function POS() {
  const features = [
    "Sales Terminal Interface",
    "Product Search & Browsing",
    "Shopping Cart Management",
    "Payment Processing",
    "Cash Register Management",
    "Inventory Sync",
    "Receipt Generation",
    "Discounts & Promotions",
    "Daily Settlement",
    "Sales Analytics",
  ];

  return (
    <ModulePlaceholder
      title="Point of Sale (POS) Module"
      description="Retail and restaurant point of sale system with sales terminals and payment processing"
      icon={<Clock className="w-8 h-8 text-teal-500" />}
      features={features}
    />
  );
}
