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
  { name: "Programs", icon: Book, href: "/admin/programs" },
  { name: "Booking", icon: Calendar, href: "/admin/booking" },
  { name: "Event", icon: Flag, href: "/admin/event" },
  { name: "Gallery", icon: Image, href: "/admin/gallery" },
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
      className={`relative h-screen flex flex-col transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
      style={{
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.05), rgba(0,0,0,0.2))",
        backdropFilter: "blur(20px)",
        borderRight: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      {/* Floating gradient blobs */}
      <div className="absolute top-10 left-5 w-40 h-40 bg-primary/30 rounded-full blur-3xl animate-float-slow" />
      <div className="absolute bottom-10 right-5 w-32 h-32 bg-secondary/30 rounded-full blur-2xl animate-float-medium" />

      {/* Sidebar content */}
      <div className="flex flex-col h-full relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          {!collapsed && (
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary select-none">
              Admin Panel
            </span>
          )}
          <button
            onClick={toggleCollapse}
            className="p-1 rounded hover:bg-primary/20 transition"
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
                    className={`flex items-center p-3 rounded-lg transition-all duration-200
                      ${
                        isActive
                          ? "bg-white/10 backdrop-blur-md shadow-md"
                          : "hover:bg-white/10 hover:backdrop-blur-sm"
                      }
                    `}
                  >
                    <item.icon
                      className={`w-6 h-6 mr-3 ${
                        isActive ? "stroke-primary" : "stroke-primary/70"
                      }`}
                    />

                    {!collapsed && (
                      <span
                        className={`ml-2 font-bold bg-clip-text text-transparent ${
                          isActive
                            ? "bg-gradient-to-r from-primary to-secondary"
                            : "bg-gradient-to-r from-primary/70 to-secondary/70"
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
        <div className="p-4 border-t border-white/10 flex flex-col gap-2 mt-auto">
          {!collapsed && (
            <>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 p-2 rounded-lg font-bold text-sm bg-white/10 backdrop-blur-md transition hover:bg-white/20"
              >
                <LogOut className="w-5 h-5 stroke-primary" />
                Logout
              </button>
            </>
          )}

          {collapsed && (
            <button
              onClick={handleLogout}
              className="flex items-center justify-center p-2 rounded-lg hover:bg-white/20 transition"
            >
              <LogOut className="w-6 h-6 stroke-primary" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
