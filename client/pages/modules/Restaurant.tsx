import React from "react";
import { UtensilsCrossed } from "lucide-react";
import ModulePlaceholder from "@/components/ModulePlaceholder";

export default function Restaurant() {
  const features = [
    "Menu Management",
    "Online Ordering",
    "Dine-in Management",
    "Kitchen Display System",
    "Delivery Tracking",
    "Payment Processing",
    "Table Reservations",
    "Delivery Partner Management",
    "Customer Reviews",
    "Sales Analytics",
  ];

  return (
    <ModulePlaceholder
      title="Restaurant & Food Ordering Module"
      description="Complete restaurant management with menu, orders, delivery, and kitchen operations"
      icon={<UtensilsCrossed className="w-8 h-8 text-rose-500" />}
      features={features}
    />
  );
}
