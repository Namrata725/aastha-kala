"use client";

import { useRouter } from "next/navigation";
import { MessageCircle, X, Calendar } from "lucide-react";
import { useEffect, useState } from "react";

export default function FloatingActions() {
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`);
        const data = await res.json();
        const whatsappNumber = data?.data?.social_links?.whatsapp_number;

        if (whatsappNumber) {
          const cleanNumber = whatsappNumber.replace(/\D/g, "");

          const formatted = cleanNumber.startsWith("977")
            ? cleanNumber
            : `977${cleanNumber}`;

          setWhatsappNumber(formatted);
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      }
    }
    fetchSettings();
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 flex flex-col items-end gap-2 md:gap-3 group">
      {/* Close Button - Always visible on mobile, hover on desktop */}
      <button
        onClick={() => setIsVisible(false)}
        className="bg-white/90 backdrop-blur-sm text-gray-400 hover:text-red-500 p-1 md:p-1.5 rounded-full shadow-md border border-gray-100 transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 md:translate-y-2 md:group-hover:translate-y-0"
        title="Close actions"
      >
        <X size={12} className="md:w-[14px] md:h-[14px]" />
      </button>

      <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4">
        {/* WhatsApp Button */}
        {whatsappNumber && (
          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="relative flex items-center justify-center bg-[#25D366] text-white p-3 md:p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 group/wa"
          >
            <span className="hidden md:block absolute right-full mr-3 px-3 py-1.5 bg-white text-gray-800 text-xs font-bold rounded-lg shadow-xl border border-gray-100 opacity-0 group-hover/wa:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Chat on WhatsApp
            </span>
            <MessageCircle
              size={20}
              className="md:w-[26px] md:h-[26px] fill-current"
            />
            <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20 pointer-events-none"></span>
          </a>
        )}
      </div>
    </div>
  );
}
