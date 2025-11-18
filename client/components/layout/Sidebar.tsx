import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronDown,
  BarChart3,
  Users,
  ShoppingCart,
  Package,
  DollarSign,
  Briefcase,
  Banknote,
  Zap,
  Settings,
  HelpCircle,
  GraduationCap,
  Stethoscope,
  Home,
  UtensilsCrossed,
  Store,
  Wrench,
  Building2,
  Grid3x3,
  LayoutGrid,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

const modules = [
  {
    icon: Grid3x3,
    label: "Dashboard",
    path: "/dashboard",
    color: "text-accent",
  },
  {
    icon: LayoutGrid,
    label: "Apps",
    path: "/apps",
    color: "text-primary",
  },
  {
    label: "SALES & MARKETING",
    items: [
      { icon: Users, label: "CRM", path: "/crm", color: "text-blue-500" },
      {
        icon: ShoppingCart,
        label: "Sales",
        path: "/sales",
        color: "text-green-500",
      },
      {
        icon: Store,
        label: "E-Commerce",
        path: "/ecommerce",
        color: "text-purple-500",
      },
    ],
  },
  {
    label: "SUPPLY CHAIN",
    items: [
      {
        icon: Package,
        label: "Purchases",
        path: "/purchases",
        color: "text-orange-500",
      },
      {
        icon: Package,
        label: "Inventory",
        path: "/inventory",
        color: "text-amber-500",
      },
      {
        icon: Zap,
        label: "Manufacturing",
        path: "/manufacturing",
        color: "text-red-500",
      },
    ],
  },
  {
    label: "FINANCE & HR",
    items: [
      {
        icon: DollarSign,
        label: "Accounting",
        path: "/accounting",
        color: "text-emerald-500",
      },
      { icon: Briefcase, label: "HR", path: "/hr", color: "text-cyan-500" },
      {
        icon: Banknote,
        label: "Payroll",
        path: "/payroll",
        color: "text-lime-500",
      },
    ],
  },
  {
    label: "OPERATIONS",
    items: [
      {
        icon: Briefcase,
        label: "Projects",
        path: "/projects",
        color: "text-indigo-500",
      },
      {
        icon: UtensilsCrossed,
        label: "Restaurant",
        path: "/restaurant",
        color: "text-rose-500",
      },
      { icon: Clock, label: "POS", path: "/pos", color: "text-teal-500" },
      {
        icon: Wrench,
        label: "Helpdesk",
        path: "/helpdesk",
        color: "text-violet-500",
      },
    ],
  },
  {
    label: "VERTICAL SOLUTIONS",
    items: [
      {
        icon: GraduationCap,
        label: "School",
        path: "/school",
        color: "text-sky-500",
      },
      {
        icon: Stethoscope,
        label: "Medical",
        path: "/medical",
        color: "text-fuchsia-500",
      },
      {
        icon: Stethoscope,
        label: "Hospital - ERP KSA",
        path: "/hospital",
        color: "text-blue-600",
      },
      {
        icon: Building2,
        label: "Real Estate",
        path: "/real-estate",
        color: "text-slate-500",
      },
    ],
  },
  {
    label: "SETTINGS",
    items: [
      {
        icon: Settings,
        label: "Administration",
        path: "/admin",
        color: "text-gray-500",
      },
    ],
  },
];

interface ModuleItem {
  icon?: typeof Users;
  label: string;
  path?: string;
  color?: string;
  items?: ModuleItem[];
}

function ModuleLink({
  item,
}: {
  item: ModuleItem & { path: string; icon: typeof Users; color: string };
}) {
  return (
    <Link
      to={item.path}
      className="group flex items-center gap-3 px-4 py-2.5 mx-2 text-sm font-medium text-sidebar-foreground hover:bg-white/10 rounded-xl transition-all duration-200 hover:shadow-glow relative overflow-hidden"
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 animate-shimmer"></div>
      <item.icon className={cn("w-5 h-5 relative z-10", item.color)} />
      <span className="relative z-10">{item.label}</span>
    </Link>
  );
}

function ModuleGroup({
  group,
  isExpanded,
  onToggle,
}: {
  group: any;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  if (!group.items) {
    return <ModuleLink item={group} />;
  }

  return (
    <div>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-3 text-xs font-bold text-sidebar-foreground/60 hover:text-sidebar-foreground uppercase tracking-widest transition-all"
      >
        <span>{group.label}</span>
        <ChevronDown
          className={cn(
            "w-4 h-4 transition-transform duration-300",
            isExpanded && "rotate-180",
          )}
        />
      </button>
      {isExpanded && (
        <div className="space-y-1 mt-1 mb-4">
          {group.items.map(
            (
              item: ModuleItem & {
                path: string;
                icon: typeof Users;
                color: string;
              },
              idx: number,
            ) => (
              <ModuleLink key={idx} item={item} />
            ),
          )}
        </div>
      )}
    </div>
  );
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(
    new Set([0, 1]),
  );

  const toggleGroup = (index: number) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedGroups(newExpanded);
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-16 bottom-0 w-64 bg-sidebar-background border-r border-sidebar-border shadow-2xl overflow-y-auto transition-transform duration-300 z-30 md:z-40",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <nav className="py-6 space-y-1">
          {modules.map((item, idx) => (
            <ModuleGroup
              key={idx}
              group={item}
              isExpanded={expandedGroups.has(idx)}
              onToggle={() => toggleGroup(idx)}
            />
          ))}
        </nav>
      </aside>
    </>
  );
}
