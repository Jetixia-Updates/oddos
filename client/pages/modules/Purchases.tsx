import React from "react";
import { Package } from "lucide-react";
import ModulePlaceholder from "@/components/ModulePlaceholder";

export default function Purchases() {
  const features = [
    "Vendor Management",
    "Purchase Requisitions",
    "Purchase Orders",
    "Goods Receipt Notes",
    "Supplier Ratings",
    "Payment Terms",
    "RFQ (Request for Quote)",
    "Purchase Analytics",
    "Automated Ordering",
    "Invoice Matching",
  ];

  return (
    <ModulePlaceholder
      title="Purchases Module"
      description="Manage purchase orders, vendor relationships, and procurement workflows"
      icon={<Package className="w-8 h-8 text-orange-500" />}
      features={features}
    />
  );
}
