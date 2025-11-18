import React from "react";
import {
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingCart,
  Package,
  DollarSign,
  ArrowRight,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const salesData = [
  { name: "Jan", value: 4000, target: 4500 },
  { name: "Feb", value: 3000, target: 4200 },
  { name: "Mar", value: 2000, target: 4000 },
  { name: "Apr", value: 2780, target: 4300 },
  { name: "May", value: 1890, target: 4100 },
  { name: "Jun", value: 2390, target: 4500 },
];

const revenueData = [
  { name: "Product Sales", value: 65000, percentage: 45 },
  { name: "Services", value: 45000, percentage: 31 },
  { name: "Subscriptions", value: 35000, percentage: 24 },
];

const departmentData = [
  { name: "Sales", employees: 45, growth: 12 },
  { name: "Operations", employees: 38, growth: 8 },
  { name: "HR", employees: 15, growth: 5 },
  { name: "Finance", employees: 22, growth: 15 },
  { name: "IT", employees: 28, growth: 10 },
];

const colors = ["#3498DB", "#27AE60", "#E74C3C", "#F39C12", "#9B59B6"];

interface KPICardProps {
  title: string;
  value: string | number;
  change: number;
  unit?: string;
  icon: React.ReactNode;
  positive?: boolean;
}

function KPICard({
  title,
  value,
  change,
  unit,
  icon,
  positive = true,
}: KPICardProps) {
  return (
    <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-lg hover:shadow-glow-lg transition-all duration-300 group relative overflow-hidden">
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 gradient-primary"></div>
      <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 bg-white dark:bg-black"></div>
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wider">{title}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-foreground group-hover:text-gradient transition-all">{value}</span>
              {unit && (
                <span className="text-sm font-medium text-muted-foreground">{unit}</span>
              )}
            </div>
          </div>
          <div className="p-3 gradient-primary rounded-xl group-hover:shadow-glow transition-all">
            {icon}
          </div>
        </div>
        <div className="flex items-center gap-2 pt-4 border-t border-border/50">
          {positive ? (
            <TrendingUp className="w-4 h-4 text-success" />
          ) : (
            <TrendingDown className="w-4 h-4 text-warning" />
          )}
          <span
            className={`text-sm font-semibold ${positive ? "text-success" : "text-warning"}`}
          >
            {positive ? "+" : ""}
            {change}%
          </span>
          <span className="text-xs text-muted-foreground">from last month</span>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-5xl font-black text-gradient mb-3 tracking-tight">Dashboard</h1>
        <p className="text-lg text-muted-foreground font-medium">
          Overview of your business performance and key metrics
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Total Revenue"
          value="$245,320"
          change={12.5}
          unit="USD"
          icon={<DollarSign className="w-7 h-7 text-primary-foreground" />}
          positive={true}
        />
        <KPICard
          title="Total Orders"
          value="1,245"
          change={8.2}
          icon={<ShoppingCart className="w-7 h-7 text-primary-foreground" />}
          positive={true}
        />
        <KPICard
          title="Inventory Value"
          value="$89,450"
          change={-3.5}
          unit="USD"
          icon={<Package className="w-7 h-7 text-primary-foreground" />}
          positive={false}
        />
        <KPICard
          title="Active Customers"
          value="2,341"
          change={15.3}
          icon={<Users className="w-7 h-7 text-primary-foreground" />}
          positive={true}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Sales Trend Chart */}
        <div className="lg:col-span-2 bg-card border border-border/50 rounded-2xl p-8 shadow-xl hover:shadow-glow transition-shadow">
          <div className="mb-8">
            <h3 className="text-xl font-bold text-foreground mb-2">
              Sales Trend vs Target
            </h3>
            <p className="text-sm text-muted-foreground font-medium">
              Monthly sales performance compared to target
            </p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "0.5rem",
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#3498DB"
                dot={false}
                strokeWidth={2}
                name="Actual"
              />
              <Line
                type="monotone"
                dataKey="target"
                stroke="#BDC3C7"
                strokeDasharray="5 5"
                dot={false}
                strokeWidth={2}
                name="Target"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Distribution */}
        <div className="bg-card border border-border/50 rounded-2xl p-8 shadow-xl hover:shadow-glow transition-shadow">
          <div className="mb-8">
            <h3 className="text-xl font-bold text-foreground mb-2">
              Revenue Distribution
            </h3>
            <p className="text-sm text-muted-foreground font-medium">By source</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={revenueData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {revenueData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={colors[index % colors.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "0.5rem",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-6 space-y-3">
            {revenueData.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: colors[idx] }}
                  ></div>
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
                <span className="font-semibold text-foreground">
                  {item.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Department Staff Distribution */}
      <div className="bg-card border border-border/50 rounded-2xl p-8 shadow-xl hover:shadow-glow transition-shadow mb-8">
        <div className="mb-8">
          <h3 className="text-xl font-bold text-foreground mb-2">
            Department Staffing & Growth
          </h3>
          <p className="text-sm text-muted-foreground font-medium">
            Employee count and year-over-year growth by department
          </p>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={departmentData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis stroke="var(--muted-foreground)" />
            <YAxis stroke="var(--muted-foreground)" />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "0.5rem",
              }}
            />
            <Bar dataKey="employees" fill="#3498DB" name="Employees" />
            <Bar dataKey="growth" fill="#27AE60" name="Growth %" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-card border border-border/50 rounded-2xl p-8 shadow-xl hover:shadow-glow transition-shadow">
          <h3 className="text-xl font-bold text-foreground mb-6">
            Quick Actions
          </h3>
          <div className="space-y-2">
            <button className="w-full flex items-center justify-between p-4 hover:bg-primary/5 rounded-xl transition-all group border border-transparent hover:border-primary/20">
              <span className="text-foreground font-semibold">
                Create New Order
              </span>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </button>
            <button className="w-full flex items-center justify-between p-4 hover:bg-primary/5 rounded-xl transition-all group border border-transparent hover:border-primary/20">
              <span className="text-foreground font-semibold">
                Generate Report
              </span>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </button>
            <button className="w-full flex items-center justify-between p-4 hover:bg-primary/5 rounded-xl transition-all group border border-transparent hover:border-primary/20">
              <span className="text-foreground font-semibold">
                View Pending Approvals
              </span>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </button>
            <button className="w-full flex items-center justify-between p-4 hover:bg-primary/5 rounded-xl transition-all group border border-transparent hover:border-primary/20">
              <span className="text-foreground font-semibold">
                Check Inventory Levels
              </span>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-card border border-border/50 rounded-2xl p-8 shadow-xl hover:shadow-glow transition-shadow">
          <h3 className="text-xl font-bold text-foreground mb-6">
            Recent Activity
          </h3>
          <div className="space-y-4">
            {[
              {
                time: "2 minutes ago",
                action: "New sale order #SO-2024-1245 created",
                status: "success",
              },
              {
                time: "1 hour ago",
                action: "Invoice INV-2024-5678 marked as paid",
                status: "success",
              },
              {
                time: "3 hours ago",
                action: "Low stock alert for Product SKU-4521",
                status: "warning",
              },
              {
                time: "Yesterday",
                action: "Monthly payroll processed for 487 employees",
                status: "success",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-4 pb-4 border-b border-border/50 last:border-0 hover:bg-muted/30 -mx-2 px-2 py-2 rounded-xl transition-colors"
              >
                <div className="pt-1">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      item.status === "success" ? "bg-success shadow-glow" : "bg-warning shadow-glow"
                    } animate-pulse`}
                  ></div>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{item.action}</p>
                  <p className="text-xs text-muted-foreground font-medium mt-1">
                    {item.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
