import React from "react";
import { Banknote } from "lucide-react";
import ModulePlaceholder from "@/components/ModulePlaceholder";

export default function Payroll() {
  const features = [
    "Salary Structure Management",
    "Monthly Payroll Processing",
    "Salary Slips Generation",
    "Tax Calculations",
    "Statutory Deductions",
    "Bank Transfers",
    "Payroll Reports",
    "Income Tax Forms",
    "Attendance Integration",
    "Bonus & Incentives",
  ];

  return (
    <ModulePlaceholder
      title="Payroll Module"
      description="Complete payroll processing including salary calculations and statutory compliance"
      icon={<Banknote className="w-8 h-8 text-lime-500" />}
      features={features}
    />
  );
}
