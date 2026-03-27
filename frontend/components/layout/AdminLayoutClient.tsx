"use client";
import React, { useEffect, useState } from "react";
import Sidebar from "@/components/admin/Sidebar";
import { useRouter } from "next/navigation";
import { DashboardProvider } from "@/lib/DashboardContext";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayoutClient({ children }: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [checked, setChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
    } else {
      setChecked(true);
    }
  }, [router]);

  if (!checked) return null;

  return (
    <DashboardProvider>
      <div className="flex min-h-screen overflow-hidden bg-slate-300 text-black">
        {/* Sidebar */}
        <Sidebar
          collapsed={collapsed}
          toggleCollapse={() => setCollapsed(!collapsed)}
        />

        {/* Main content */}
        <main
          className={`flex-1 p-6 overflow-auto transition-all duration-300 ${
            collapsed ? "ml-20" : "ml-64"
          }`}
        >
          <div className="relative w-full h-full min-h-screen z-10">
            {children}
          </div>
        </main>
      </div>
    </DashboardProvider>
  );
}
