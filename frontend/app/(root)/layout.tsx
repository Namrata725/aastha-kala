"use client";

import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function PublicLayout({ children }: AdminLayoutProps) {
  const router = useRouter();

  return (
    <div>
      <Navbar />

      <main className="public-content">{children}</main>
      <Footer />
    </div>
  );
}
