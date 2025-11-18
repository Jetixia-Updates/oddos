import React from "react";
import { ArrowRight, Lightbulb } from "lucide-react";
import { Link } from "react-router-dom";

interface ModulePlaceholderProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  features?: string[];
}

export default function ModulePlaceholder({
  title,
  description,
  icon,
  features = [],
}: ModulePlaceholderProps) {
  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-primary/10 rounded-lg">{icon}</div>
          <div>
            <h1 className="text-4xl font-bold text-foreground">{title}</h1>
            <p className="text-muted-foreground mt-2">{description}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Info */}
        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-lg p-8 mb-8">
            <div className="flex items-start gap-4 mb-8">
              <Lightbulb className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  Coming Soon
                </h2>
                <p className="text-muted-foreground">
                  This module is ready to be customized with your specific
                  business requirements. Complete documentation and
                  specifications are available in the ERP_SYSTEM_DESIGN.md file.
                </p>
              </div>
            </div>

            <div className="border-t border-border pt-8">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Module Documentation
              </h3>
              <p className="text-muted-foreground mb-4">
                This module is part of a comprehensive ERP system design. To
                view the complete specifications including:
              </p>
              <ul className="space-y-2 text-muted-foreground mb-6">
                <li className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-primary" />
                  Database schema and tables
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-primary" />
                  User interface views (List, Form, Kanban, Dashboard)
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-primary" />
                  Business logic and automation rules
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-primary" />
                  User permissions and role definitions
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-primary" />
                  Workflow and state machines
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-primary" />
                  Entity relationship diagrams (ERD)
                </li>
              </ul>
              <p className="text-sm text-muted-foreground">
                Please refer to the{" "}
                <code className="bg-background px-2 py-1 rounded text-primary">
                  ERP_SYSTEM_DESIGN.md
                </code>{" "}
                file in the project root for the complete system documentation.
              </p>
            </div>
          </div>

          {/* Features List */}
          {features.length > 0 && (
            <div className="bg-card border border-border rounded-lg p-8">
              <h3 className="text-lg font-semibold text-foreground mb-6">
                Module Features
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {features.map((feature, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-secondary/5 rounded-lg border border-secondary/10"
                  >
                    <p className="text-sm text-foreground font-medium">
                      {feature}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Quick Info */}
        <div>
          <div className="bg-accent/10 border border-accent/30 rounded-lg p-6 sticky top-20">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Next Steps
            </h3>
            <ol className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-3">
                <span className="font-bold text-accent flex-shrink-0">1</span>
                <span>
                  Review the module documentation in ERP_SYSTEM_DESIGN.md
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-accent flex-shrink-0">2</span>
                <span>Design your database schema and data models</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-accent flex-shrink-0">3</span>
                <span>Create API endpoints for CRUD operations</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-accent flex-shrink-0">4</span>
                <span>Build React components for user interfaces</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-accent flex-shrink-0">5</span>
                <span>Implement business logic and automations</span>
              </li>
            </ol>

            <Link to="/" className="mt-6 w-full block">
              <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
                Back to Dashboard
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
