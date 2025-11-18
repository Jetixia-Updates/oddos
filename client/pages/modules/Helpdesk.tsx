import React from "react";
import { Wrench } from "lucide-react";
import ModulePlaceholder from "@/components/ModulePlaceholder";

export default function Helpdesk() {
  const features = [
    "Ticket Management",
    "SLA Tracking",
    "Knowledge Base",
    "Email Integration",
    "Ticket Routing",
    "Priority Management",
    "Customer Portal",
    "Satisfaction Surveys",
    "Performance Metrics",
    "Multi-channel Support",
  ];

  return (
    <ModulePlaceholder
      title="Helpdesk Module"
      description="Customer support ticketing system with SLA management and knowledge base"
      icon={<Wrench className="w-8 h-8 text-violet-500" />}
      features={features}
    />
  );
}
