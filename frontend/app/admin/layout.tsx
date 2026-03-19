"use client";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/admin/Sidebar";
import FloatingBlobs from "@/components/layout/FloadtingBlobs";
import ToastProvider from "@/components/layout/ToastProvider";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
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
    <div className="flex min-h-screen bg-gray-100 dark:bg-[var(--background)]">
      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        toggleCollapse={() => setCollapsed(!collapsed)}
      />

      {/* Main content */}
      <main className="flex-1 p-6 overflow-auto transition-all duration-300">
        <FloatingBlobs />
        {children}
        <ToastProvider />
      </main>
    </div>
  );
}
