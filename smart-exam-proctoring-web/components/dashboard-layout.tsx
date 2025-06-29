"use client";

import type React from "react";
import {
  Monitor,
  FileText,
  Settings,
  Bell,
  LogOut,
  AlertTriangle,
  Database,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentView: string;
  onViewChange: (view: string) => void;
}

const navigation = [
  { name: "Exam Dashboard", icon: Monitor, id: "dashboard" },
  { name: "Live Monitoring", icon: Monitor, id: "monitoring" },
  { name: "Reports & Evidence", icon: FileText, id: "reports" },
  { name: "Firebase Test", icon: Database, id: "firebase-test" },
  { name: "Settings", icon: Settings, id: "settings" },
];

export function DashboardLayout({
  children,
  currentView,
  onViewChange,
}: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex h-screen bg-gray-50">
        <Sidebar className="border-r border-exam-gray">
          <SidebarHeader className="p-6 border-b border-exam-gray">
            <div className="flex items-center space-x-3">
              <div className="w-15 h-15 bg-blue-900/80 rounded-lg flex items-center justify-center">
                <img
                  src="/exam-logo.jpeg"
                  alt="Exam Logo"
                  className="w-12 h-12 object-cover rounded"
                />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-blue-900">
                  ProctorView
                </h1>
                <p className="text-sm text-gray-600">Exam Monitoring</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="p-4">
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onViewChange(item.id);
                    }}
                    isActive={currentView === item.id}
                    className={cn(
                      "w-full justify-start",
                      "hover:bg-blue-100 hover:text-blue-800",
                      "focus:bg-blue-100 focus:text-blue-800",
                      currentView === item.id && ["!bg-blue-900 !text-white"]
                    )}
                    style={
                      currentView === item.id
                        ? {
                            backgroundColor: "#1e3a8a",
                            color: "white",
                          }
                        : undefined
                    }
                  >
                    <item.icon
                      className={cn(
                        "w-5 h-5",
                        currentView === item.id && "text-white"
                      )}
                    />
                    <span
                      className={cn(
                        "font-medium",
                        currentView === item.id && "text-white font-semibold"
                      )}
                    >
                      {item.name}
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-4 border-t border-exam-gray">
            <div className="flex items-center space-x-3 mb-4">
              <Avatar className="w-8 h-8">
                <AvatarImage src="/placeholder.svg?height=32&width=32" />
                <AvatarFallback>JP</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  Denny Dang
                </p>
                <p className="text-xs text-gray-500 truncate">FPT Lecturer</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </Button>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex-1">
          <header className="bg-white border-b border-exam-gray px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <SidebarTrigger />
                <div>
                  <h2 className="text-xl font-semibold text-blue-900">
                    {navigation.find((nav) => nav.id === currentView)?.name}
                  </h2>
                  <p className="text-sm text-gray-600">
                    Real-time exam monitoring and management
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative hover:bg-gray-100 transition-colors duration-200"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                </Button>
                <Avatar className="w-8 h-8">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" />
                  <AvatarFallback>JP</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
