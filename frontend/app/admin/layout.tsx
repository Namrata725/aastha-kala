import AdminLayoutClient from "@/components/layout/AdminLayoutClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Page",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
