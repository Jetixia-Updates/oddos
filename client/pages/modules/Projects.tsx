import React from "react";
import { Briefcase } from "lucide-react";
import ModulePlaceholder from "@/components/ModulePlaceholder";

export default function Projects() {
  const features = [
    "Project Planning",
    "Task Management",
    "Gantt Charts",
    "Team Allocation",
    "Time Tracking",
    "Budget Management",
    "Milestone Tracking",
    "Risk Management",
    "Issue Tracking",
    "Project Analytics",
  ];

  return (
    <ModulePlaceholder
      title="Projects Module"
      description="Complete project management with resource allocation and milestone tracking"
      icon={<Briefcase className="w-8 h-8 text-indigo-500" />}
      features={features}
    />
  );
}
