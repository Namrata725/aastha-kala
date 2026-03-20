"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Navbar: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", path: "/" },
    { name: "About Us", path: "/about" },
    { name: "Programs", path: "/programs" },
    { name: "Instructors", path: "/instructors" },
    { name: "Events", path: "/events" },
    { name: "Gallery", path: "/gallery" },
  ];

  return (
    <nav className="w-full bg-blue-700 text-white ">
      <div className="px-6 py-6 flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo */}
      <div className="flex items-center">
        <img src="/logo.jpg" alt="Logo" className="h-10 w-auto" />
      </div>

      {/* Links */}
      <div className="hidden md:flex items-center space-x-8 font-medium">
        {navItems.map((item) => {
          const isActive = pathname === item.path;

          return (
            <Link
              key={item.name}
              href={item.path}
              className={`transition hover:text-gray-200 ${
                isActive ? "font-semibold underline underline-offset-4" : ""
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </div>

      {/* Contact Button */}
      <div>
        <button className="border border-white rounded-full px-5 py-1.5 hover:bg-white hover:text-blue-700 transition">
          Contact
        </button>
      </div>
      </div>
    </nav>
  );
};

export default Navbar;
