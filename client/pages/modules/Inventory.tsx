import React from "react";
import { Package } from "lucide-react";
import ModulePlaceholder from "@/components/ModulePlaceholder";

export default function Inventory() {
  const features = [
    "Stock Level Tracking",
    "Multi-Warehouse Management",
    "Stock Movements",
    "Cycle Counting",
    "Stock Transfers",
    "Inventory Valuation",
    "Barcode Management",
    "Low Stock Alerts",
    "Inventory Reports",
    "Supplier Sync",
  ];

  return (
    <ModulePlaceholder
      title="Inventory Module"
      description="Complete inventory management including stock tracking, warehouse operations"
      icon={<Package className="w-8 h-8 text-amber-500" />}
      features={features}
    />
  );
}
