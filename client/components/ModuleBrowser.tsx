import React, { useState } from "react";
import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ModuleCard {
  icon: LucideIcon;
  title: string;
  description: string;
  path: string;
  category: string;
  color: string;
  installed?: boolean;
}

interface ModuleBrowserProps {
  modules: ModuleCard[];
  title?: string;
  description?: string;
  initialCategory?: string;
}

export default function ModuleBrowser({
  modules,
  title = "Apps",
  description = "Discover and manage your business applications",
  initialCategory = "All",
}: ModuleBrowserProps) {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState("");

  // Get unique categories and count
  const categories = ["All", ...new Set(modules.map((m) => m.category))];
  const categoryCounts = categories.map((cat) => ({
    name: cat,
    count: cat === "All" ? modules.length : modules.filter((m) => m.category === cat).length,
  }));

  // Filter modules
  const filteredModules = modules.filter((module) => {
    const matchesCategory = selectedCategory === "All" || module.category === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      module.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-black text-gradient mb-3 tracking-tight">
            {title}
          </h1>
          <p className="text-lg text-muted-foreground font-medium">
            {description}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Categories */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
                Categories
              </h2>
              <div className="space-y-1">
                {categoryCounts.map((category) => (
                  <button
                    key={category.name}
                    onClick={() => setSelectedCategory(category.name)}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                      selectedCategory === category.name
                        ? "bg-primary text-primary-foreground shadow-glow"
                        : "text-foreground hover:bg-muted"
                    )}
                  >
                    <span>{category.name}</span>
                    <span
                      className={cn(
                        "text-xs px-2 py-0.5 rounded-full",
                        selectedCategory === category.name
                          ? "bg-primary-foreground/20"
                          : "bg-muted-foreground/20"
                      )}
                    >
                      {category.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content - Module Cards */}
          <div className="lg:col-span-3">
            {/* Search Bar */}
            <div className="mb-8">
              <input
                type="text"
                placeholder="Search applications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-3 bg-card border border-border/50 rounded-xl text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              />
            </div>

            {/* Module Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredModules.map((module, idx) => (
                <Link
                  key={idx}
                  to={module.path}
                  className="group bg-card border border-border/50 rounded-2xl p-6 shadow-lg hover:shadow-glow-lg transition-all duration-300 relative overflow-hidden"
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 gradient-primary"></div>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 bg-white dark:bg-black"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-start gap-4 mb-4">
                      <div className={cn(
                        "p-3 rounded-xl shadow-lg transition-all group-hover:shadow-glow",
                        module.color
                      )}>
                        <module.icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-gradient transition-all">
                          {module.title}
                        </h3>
                        {module.installed && (
                          <span className="inline-block px-2 py-0.5 text-xs font-semibold bg-success/20 text-success rounded-full">
                            Installed
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {module.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            {filteredModules.length === 0 && (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-lg">
                  No modules found matching your criteria.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
