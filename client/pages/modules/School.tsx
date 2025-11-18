import React from "react";
import { GraduationCap } from "lucide-react";
import ModulePlaceholder from "@/components/ModulePlaceholder";

export default function School() {
  const features = [
    "Student Enrollment",
    "Class Management",
    "Attendance Tracking",
    "Marks Management",
    "Report Cards",
    "Fee Management",
    "Teacher Portal",
    "Parent Portal",
    "Academic Calendar",
    "Performance Analytics",
  ];

  return (
    <ModulePlaceholder
      title="School Management Module"
      description="Complete school management system with student enrollment, classes, and academic records"
      icon={<GraduationCap className="w-8 h-8 text-sky-500" />}
      features={features}
    />
  );
}
