import React from "react";
import { Stethoscope } from "lucide-react";
import ModulePlaceholder from "@/components/ModulePlaceholder";

export default function Medical() {
  const features = [
    "Patient Records",
    "Appointment Scheduling",
    "Medical History",
    "Prescriptions",
    "Lab Tests",
    "Billing & Invoicing",
    "Doctor Portal",
    "Patient Portal",
    "Insurance Claims",
    "Medical Analytics",
  ];

  return (
    <ModulePlaceholder
      title="Medical Management Module"
      description="Complete healthcare management system with patient records and appointments"
      icon={<Stethoscope className="w-8 h-8 text-fuchsia-500" />}
      features={features}
    />
  );
}
