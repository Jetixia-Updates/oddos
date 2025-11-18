import React from "react";
import { Zap } from "lucide-react";
import ModulePlaceholder from "@/components/ModulePlaceholder";

export default function Manufacturing() {
  const features = [
    "Bill of Materials (BOM)",
    "Production Orders",
    "Shop Floor Control",
    "Quality Control",
    "Work Order Management",
    "Machine Maintenance",
    "Operation Scheduling",
    "Cost Tracking",
    "Production Reports",
    "Waste Management",
  ];

  return (
    <ModulePlaceholder
      title="Manufacturing Module"
      description="Complete manufacturing management including bill of materials and quality control"
      icon={<Zap className="w-8 h-8 text-red-500" />}
      features={features}
    />
  );
}
