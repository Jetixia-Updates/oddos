import React from "react";
import { Settings } from "lucide-react";
import ModulePlaceholder from "@/components/ModulePlaceholder";

export default function Admin() {
  const features = [
    "User Management",
    "Role Management",
    "Permission Management",
    "Audit Trail",
    "System Settings",
    "Email Templates",
    "API Keys",
    "Backup Management",
    "Data Migration",
    "System Health",
  ];

  return (
    <ModulePlaceholder
      title="Administration & Permissions Module"
      description="System-wide administration, user management, and role-based access control"
      icon={<Settings className="w-8 h-8 text-gray-500" />}
      features={features}
    />
  );
}
