import React from "react";
import { Briefcase } from "lucide-react";
import ModulePlaceholder from "@/components/ModulePlaceholder";

export default function HR() {
  const features = [
    "Employee Directory",
    "Attendance Tracking",
    "Leave Management",
    "Performance Reviews",
    "Skills Management",
    "Organization Chart",
    "Document Management",
    "Employee Self-Service",
    "Recruitment",
    "Employee Analytics",
  ];

  return (
    <ModulePlaceholder
      title="Human Resources (HR) Module"
      description="Complete HR management including employee data, attendance, leaves, and performance"
      icon={<Briefcase className="w-8 h-8 text-cyan-500" />}
      features={features}
    />
  );
}
