"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [logo, setLogo] = useState<string>("/logo.jpg");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`);
        const data = await res.json();
        if (data.success && data.data.setting?.logo) {
          setLogo(data.data.setting.logo);
        }
      } catch (error) {
        console.error("Failed to fetch settings for logo:", error);
      }
    };
    fetchSettings();
  }, []);

  const navItems = [
    { name: "Home", path: "/" },
    { name: "About Us", path: "/about" },
    { name: "Programs", path: "/programs" },
    { name: "Instructors", path: "/instructors" },
    { name: "Events", path: "/events" },
    { name: "Gallery", path: "/gallery" },
  ];

  return (
    <nav className="w-full bg-blue-700 text-white">
      <div className="px-6 py-2 flex items-center max-w-7xl mx-auto">

        {/* Logo — far left, fixed width */}
        <div className="flex items-center shrink-0">
          <Link href="/">
            <img src={logo} alt="Logo" className="h-16 w-auto" />
          </Link>
        </div>

        {/* Nav links + Contact — takes remaining space, items spread to the right */}
        <div className="hidden md:flex items-center justify-end flex-1 gap-x-10 font-medium">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.name}
                href={item.path}
                className={`whitespace-nowrap transition hover:text-gray-200 ${isActive ? "font-semibold underline underline-offset-4" : ""
                  }`}
              >
                {item.name}
              </Link>
            );
          })}

          <Link href="/contact" className="shrink-0">
            <button className="border border-white rounded-full px-5 py-1.5 hover:bg-white hover:text-blue-700 transition font-medium whitespace-nowrap">
              Contact
            </button>
          </Link>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;