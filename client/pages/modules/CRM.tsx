import React from "react";
import { Users } from "lucide-react";
import ModulePlaceholder from "@/components/ModulePlaceholder";

export default function CRM() {
  const features = [
    "Customer Database Management",
    "Lead Management & Scoring",
    "Sales Opportunity Pipeline",
    "Activity Tracking",
    "Sales Automation Rules",
    "Customer Analytics",
    "Email Integration",
    "Task Management",
    "Customer Portal",
    "Reporting & Forecasting",
  ];

  return (
    <ModulePlaceholder
      title="Customer Relationship Management (CRM)"
      description="Manage all customer interactions, sales leads, opportunities, and customer communications"
      icon={<Users className="w-8 h-8 text-blue-500" />}
      features={features}
    />
  );
}
