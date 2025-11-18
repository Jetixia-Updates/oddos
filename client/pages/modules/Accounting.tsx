import React from "react";
import { DollarSign } from "lucide-react";
import ModulePlaceholder from "@/components/ModulePlaceholder";

export default function Accounting() {
  const features = [
    "Chart of Accounts",
    "Journal Entries",
    "General Ledger",
    "Accounts Receivable",
    "Accounts Payable",
    "Bank Reconciliation",
    "Financial Statements",
    "Cost Centers",
    "Tax Reporting",
    "Financial Analytics",
  ];

  return (
    <ModulePlaceholder
      title="Accounting Module"
      description="Complete financial management including general ledger and financial reporting"
      icon={<DollarSign className="w-8 h-8 text-emerald-500" />}
      features={features}
    />
  );
}
