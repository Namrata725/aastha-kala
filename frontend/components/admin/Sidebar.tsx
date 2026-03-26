"use client";
import { useEffect } from "react";
import {
  Home,
  Settings,
  Book,
  Mail,
  Calendar,
  User,
  Flag,
  Image,
  LogOut,
  Mic,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

interface SidebarProps {
  collapsed: boolean;
  toggleCollapse: () => void;
}

const menuItems = [
  { name: "Dashboard", icon: Home, href: "/admin" },
  { name: "Instructor", icon: User, href: "/admin/instructor" },
  { name: "Instructor Schedule", icon: Calendar, href: "/admin/instructor/schedule" },
  { name: "Programs", icon: Book, href: "/admin/programs" },
  { name: "Booking", icon: Calendar, href: "/admin/booking" },
  { name: "Event", icon: Flag, href: "/admin/event" },
  { name: "Gallery", icon: Image, href: "/admin/gallery" },
  { name: "Testimonials", icon: Mic, href: "/admin/testimonials" },
  { name: "Contact Us", icon: Mail, href: "/admin/contact" },
  { name: "Settings", icon: Settings, href: "/admin/settings" },
];

export default function Sidebar({ collapsed, toggleCollapse }: SidebarProps) {
  const router = useRouter();

  const pathname = usePathname();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");

      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.push("/login");
    }
  };
  return (
    <aside
      className={`fixed top-0 left-0 h-screen flex flex-col transition-all duration-300 bg-gray-400 ${
        collapsed ? "w-20" : "w-64"
      }`}
      style={{
        borderRight: "1px solid #e2e8f0",
        boxShadow: "4px 0 15px rgba(0,0,0,0.03)"
      }}
    >
      {/* Sidebar content */}
      <div className="flex flex-col h-screen relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          {!collapsed && (
            <span className="text-2xl font-black text-black select-none tracking-tight">
              Aastha Kala
            </span>
          )}
          <button
            onClick={toggleCollapse}
            className="p-1.5 rounded-lg bg-white/30 hover:bg-white/50 border border-white/10 transition-all duration-300 text-gray-900"
          >
            {collapsed ? "→" : "←"}
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto mt-4">
          <ul className="flex flex-col space-y-2 px-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <li key={item.name} className="relative group">
                  <Link
                    href={item.href}
                    className={`flex items-center p-2 rounded-xl transition-all duration-300 text-sm font-semibold
                      ${
                        isActive
                          ? "bg-white/40 shadow-sm border border-white/20"
                          : "hover:bg-white/20 text-gray-900"
                      }
                    `}
                  >
                    <item.icon
                      className={`w-5 h-5 mr-3 shrink-0 ${
                        isActive ? "stroke-primary" : "stroke-gray-800"
                      }`}
                    />

                    {!collapsed && (
                      <span
                        className={`ml-2 font-bold ${
                          isActive
                            ? "text-primary"
                            : "text-gray-900"
                        }`}
                      >
                        {item.name}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer with Logout */}
        <div className="p-4 border-t border-gray-100 flex flex-col gap-2 mt-auto">
          {!collapsed && (
            <>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl font-bold text-sm bg-white/30 border border-white/10 transition-all duration-300 hover:bg-white/50 text-gray-900 shadow-sm"
              >
                <LogOut className="w-5 h-5 stroke-primary cursor-pointer" />
                Logout
              </button>
            </>
          )}

          {collapsed && (
            <button
              onClick={handleLogout}
              className="flex items-center justify-center p-2.5 rounded-xl hover:bg-white/40 border border-transparent hover:border-white/20 transition-all duration-300 text-gray-900"
            >
              <LogOut className="w-5 h-5 stroke-primary" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
