import React from "react";
import { Link } from "react-router-dom";
import {
  Users,
  ShoppingCart,
  Package,
  DollarSign,
  Briefcase,
  Banknote,
  Zap,
  Grid3x3,
  HelpCircle,
  GraduationCap,
  Stethoscope,
  Building2,
  UtensilsCrossed,
  Store,
  Wrench,
  Clock,
  TrendingUp,
  Activity,
  AlertCircle,
} from "lucide-react";

const modules = [
  {
    title: "CRM",
    description: "Manage customer relationships and sales pipeline",
    icon: Users,
    path: "/crm",
    color: "bg-blue-500/10 border-blue-200 dark:border-blue-900",
    iconColor: "text-blue-500",
    stats: { label: "Active Customers", value: "2,341" },
  },
  {
    title: "Sales",
    description: "Process quotations and sales orders",
    icon: ShoppingCart,
    path: "/sales",
    color: "bg-green-500/10 border-green-200 dark:border-green-900",
    iconColor: "text-green-500",
    stats: { label: "Orders This Month", value: "156" },
  },
  {
    title: "Purchases",
    description: "Manage purchase orders and vendor relationships",
    icon: Package,
    path: "/purchases",
    color: "bg-orange-500/10 border-orange-200 dark:border-orange-900",
    iconColor: "text-orange-500",
    stats: { label: "Pending POs", value: "23" },
  },
  {
    title: "Inventory",
    description: "Track stock levels and warehouse operations",
    icon: Package,
    path: "/inventory",
    color: "bg-amber-500/10 border-amber-200 dark:border-amber-900",
    iconColor: "text-amber-500",
    stats: { label: "Low Stock Items", value: "12" },
  },
  {
    title: "Accounting",
    description: "Manage finances and generate reports",
    icon: DollarSign,
    path: "/accounting",
    color: "bg-emerald-500/10 border-emerald-200 dark:border-emerald-900",
    iconColor: "text-emerald-500",
    stats: { label: "Accounts Receivable", value: "$45.2K" },
  },
  {
    title: "HR",
    description: "Manage employees and payroll",
    icon: Briefcase,
    path: "/hr",
    color: "bg-cyan-500/10 border-cyan-200 dark:border-cyan-900",
    iconColor: "text-cyan-500",
    stats: { label: "Total Employees", value: "487" },
  },
  {
    title: "Projects",
    description: "Plan and track project execution",
    icon: Briefcase,
    path: "/projects",
    color: "bg-indigo-500/10 border-indigo-200 dark:border-indigo-900",
    iconColor: "text-indigo-500",
    stats: { label: "Active Projects", value: "18" },
  },
  {
    title: "Manufacturing",
    description: "Manage production and quality control",
    icon: Zap,
    path: "/manufacturing",
    color: "bg-red-500/10 border-red-200 dark:border-red-900",
    iconColor: "text-red-500",
    stats: { label: "Production Orders", value: "34" },
  },
  {
    title: "POS",
    description: "Point of sale and retail transactions",
    icon: Clock,
    path: "/pos",
    color: "bg-teal-500/10 border-teal-200 dark:border-teal-900",
    iconColor: "text-teal-500",
    stats: { label: "Today's Sales", value: "$8,420" },
  },
  {
    title: "E-Commerce",
    description: "Online store and customer orders",
    icon: Store,
    path: "/ecommerce",
    color: "bg-purple-500/10 border-purple-200 dark:border-purple-900",
    iconColor: "text-purple-500",
    stats: { label: "Online Orders", value: "243" },
  },
  {
    title: "Helpdesk",
    description: "Customer support and ticket management",
    icon: Wrench,
    path: "/helpdesk",
    color: "bg-violet-500/10 border-violet-200 dark:border-violet-900",
    iconColor: "text-violet-500",
    stats: { label: "Open Tickets", value: "28" },
  },
  {
    title: "School",
    description: "School management and student records",
    icon: GraduationCap,
    path: "/school",
    color: "bg-sky-500/10 border-sky-200 dark:border-sky-900",
    iconColor: "text-sky-500",
    stats: { label: "Total Students", value: "1,245" },
  },
  {
    title: "Medical",
    description: "Healthcare and patient management",
    icon: Stethoscope,
    path: "/medical",
    color: "bg-fuchsia-500/10 border-fuchsia-200 dark:border-fuchsia-900",
    iconColor: "text-fuchsia-500",
    stats: { label: "Appointments Today", value: "32" },
  },
  {
    title: "Real Estate",
    description: "Property and tenant management",
    icon: Building2,
    path: "/real-estate",
    color: "bg-slate-500/10 border-slate-200 dark:border-slate-900",
    iconColor: "text-slate-500",
    stats: { label: "Active Properties", value: "156" },
  },
  {
    title: "Restaurant",
    description: "Food ordering and kitchen operations",
    icon: UtensilsCrossed,
    path: "/restaurant",
    color: "bg-rose-500/10 border-rose-200 dark:border-rose-900",
    iconColor: "text-rose-500",
    stats: { label: "Today's Orders", value: "187" },
  },
];

const quickStats = [
  {
    icon: TrendingUp,
    label: "Total Revenue",
    value: "$245,320",
    change: "+12.5%",
    positive: true,
  },
  {
    icon: Activity,
    label: "Active Users",
    value: "124",
    change: "+8 this month",
    positive: true,
  },
  {
    icon: AlertCircle,
    label: "Pending Actions",
    value: "42",
    change: "+5 since yesterday",
    positive: false,
  },
];

export default function Home() {
  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-5xl font-black text-gradient mb-3 tracking-tight">
          Welcome to ERP System
        </h1>
        <p className="text-muted-foreground text-lg font-medium">
          Manage all aspects of your business from one unified platform
        </p>
        <Link
          to="/apps"
          className="inline-flex items-center gap-2 mt-4 px-6 py-3 gradient-primary text-primary-foreground rounded-xl font-semibold shadow-glow hover:shadow-glow-lg transition-all"
        >
          <Grid3x3 className="w-5 h-5" />
          Browse All Apps
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {quickStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="bg-card border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {stat.value}
                  </p>
                </div>
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
              </div>
              <p
                className={`text-sm font-medium ${stat.positive ? "text-success" : "text-warning"}`}
              >
                {stat.change}
              </p>
            </div>
          );
        })}
      </div>

      {/* Modules Grid */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-6">
          Business Modules
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {modules.map((module, idx) => {
            const Icon = module.icon;
            return (
              <Link key={idx} to={module.path}>
                <div
                  className={`h-full ${module.color} border rounded-lg p-6 hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer group`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`p-3 bg-white/50 dark:bg-black/30 rounded-lg`}
                    >
                      <Icon className={`w-6 h-6 ${module.iconColor}`} />
                    </div>
                  </div>
                  <h3 className="font-semibold text-foreground text-lg mb-2 group-hover:text-primary transition-colors">
                    {module.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {module.description}
                  </p>
                  <div className="pt-4 border-t border-border/50">
                    <p className="text-xs text-muted-foreground mb-1">
                      {module.stats.label}
                    </p>
                    <p className="text-lg font-bold text-foreground">
                      {module.stats.value}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-accent/10 border border-accent/30 rounded-lg p-6 mt-12">
        <h3 className="font-semibold text-foreground mb-2">System Overview</h3>
        <p className="text-muted-foreground">
          This comprehensive ERP system includes 16 specialized modules covering
          Sales & Marketing, Supply Chain, Finance & HR, Operations, and
          Vertical Solutions. Navigate to any module using the sidebar menu or
          click on a module card to get started.
        </p>
      </div>
    </div>
  );
}
