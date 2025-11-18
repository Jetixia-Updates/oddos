import React from "react";
import { ShoppingCart } from "lucide-react";
import ModulePlaceholder from "@/components/ModulePlaceholder";

export default function Sales() {
  const features = [
    "Quotations Management",
    "Sales Orders",
    "Invoice Generation",
    "Pricing & Discounts",
    "Delivery Tracking",
    "Payment Processing",
    "Sales Analytics",
    "Customer Communication",
    "Document Templates",
    "Revenue Recognition",
  ];

  return (
    <ModulePlaceholder
      title="Sales Module"
      description="Manage quotations, sales orders, and invoices with integrated workflow"
      icon={<ShoppingCart className="w-8 h-8 text-green-500" />}
      features={features}
    />
  );
}
