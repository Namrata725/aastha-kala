"use client";

import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();

  return (
    <div>
      <Navbar />

      <main>{children}</main>
    </div>
  );
}
