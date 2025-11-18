import React, { useState } from "react";
import {
  Menu,
  Search,
  Bell,
  Settings,
  LogOut,
  User,
  Moon,
  Sun,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onMenuClick: () => void;
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

export default function Header({
  onMenuClick,
  isDarkMode,
  onThemeToggle,
}: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 h-16 glass border-b border-border/50 shadow-lg backdrop-blur-xl z-40">
      <div className="flex items-center justify-between h-full px-6">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="p-2 hover:bg-primary/10 rounded-xl transition-all duration-200 hover:shadow-glow"
            aria-label="Toggle menu"
          >
            <Menu className="w-6 h-6 text-foreground" />
          </button>
          <div className="hidden sm:flex items-center gap-3">
            <div className="text-2xl font-black text-gradient tracking-tight">ERP</div>
            <div className="h-6 w-px bg-border"></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Elite System
            </span>
          </div>
        </div>

        {/* Center Section - Search */}
        <div className="hidden md:flex flex-1 max-w-xl mx-8">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search modules, documents..."
              className="w-full pl-12 pr-4 py-2.5 bg-background/50 border border-border rounded-xl text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 focus:bg-background"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            onClick={onThemeToggle}
            className="p-2.5 hover:bg-primary/10 rounded-xl transition-all duration-200 hover:shadow-glow relative overflow-hidden group"
            aria-label="Toggle theme"
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-foreground group-hover:text-primary transition-colors" />
            ) : (
              <Moon className="w-5 h-5 text-foreground group-hover:text-primary transition-colors" />
            )}
          </button>

          {/* Notifications */}
          <button className="p-2.5 hover:bg-primary/10 rounded-xl transition-all duration-200 hover:shadow-glow relative group">
            <Bell className="w-5 h-5 text-foreground group-hover:text-primary transition-colors" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-warning rounded-full animate-pulse shadow-glow"></span>
          </button>

          {/* Settings */}
          <button className="p-2.5 hover:bg-primary/10 rounded-xl transition-all duration-200 hover:shadow-glow group">
            <Settings className="w-5 h-5 text-foreground group-hover:text-primary transition-colors" />
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="p-2 hover:bg-primary/10 rounded-xl transition-all duration-200 hover:shadow-glow flex items-center gap-3 ml-2 group"
            >
              <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-all">
                <User className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="hidden sm:inline text-sm font-medium text-foreground">
                Admin
              </span>
            </button>

            {/* User Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-3 w-56 glass border border-border/50 rounded-xl shadow-2xl py-2 z-50 overflow-hidden">
                <button className="w-full px-4 py-2.5 text-left text-sm font-medium text-foreground hover:bg-primary/10 flex items-center gap-3 transition-all">
                  <User className="w-4 h-4" />
                  My Profile
                </button>
                <button className="w-full px-4 py-2.5 text-left text-sm font-medium text-foreground hover:bg-primary/10 flex items-center gap-3 transition-all">
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
                <div className="border-t border-border/50 my-2"></div>
                <button className="w-full px-4 py-2.5 text-left text-sm font-medium text-destructive hover:bg-destructive/10 flex items-center gap-3 transition-all">
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
