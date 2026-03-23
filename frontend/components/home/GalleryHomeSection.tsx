"use client";

import React, { useEffect, useState } from "react";
import ClientGallery from "@/components/client/ClientGallery";
import { Facebook, Instagram, Youtube } from "lucide-react";

interface GalleryHomeSectionProps {
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    tiktok?: string;
    x?: string;
    youtube?: string;
  };
}

const ensureAbsoluteUrl = (url?: string) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `https://${url}`;
};

const GalleryHomeSection: React.FC<GalleryHomeSectionProps> = ({
  socialLinks,
}) => {
  const [gallery, setGallery] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [galleryRes, categoriesRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/galleries`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/gallery-categories`),
        ]);
        const galleryData = await galleryRes.json();
        const categoriesData = await categoriesRes.json();
        setGallery(galleryData || []);
        setCategories(categoriesData || []);
      } catch (err) {
        console.error("Failed to fetch gallery data", err);
      }
    };
    fetchData();
  }, []);

  const socials = [
    {
      id: "facebook",
      icon: <Facebook className="w-6 h-6" />,
      url: ensureAbsoluteUrl(socialLinks?.facebook),
      className: "bg-[#1877F2] text-white border-transparent hover:shadow-[0_8px_20px_-8px_#1877F2]",
    },
    {
      id: "instagram",
      icon: <Instagram className="w-6 h-6" />,
      url: ensureAbsoluteUrl(socialLinks?.instagram),
      className: "bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white border-transparent hover:shadow-[0_8px_20px_-8px_#ee2a7b]",
    },
    {
      id: "tiktok",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-6 h-6"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.6-4.13-1.45-.1.74-.12 1.49-.12 2.24 0 2.44-.68 4.96-2.52 6.58-1.89 1.74-4.7 2.22-7.09 1.58-2.6-.74-4.56-2.99-4.99-5.61-.56-3.23 1.25-6.66 4.28-7.82.52-.2 1.07-.33 1.62-.41V9.58c-1.54.21-2.91 1.23-3.4 2.73-.65 1.83.1 4.09 1.83 5 1.73.95 4.15.54 5.39-1.04.53-.66.82-1.49.82-2.33V0h.01Z" />
        </svg>
      ),
      url: ensureAbsoluteUrl(socialLinks?.tiktok),
      className: "bg-black text-white border-transparent hover:shadow-[0_8px_30px_-8px_rgba(0,0,0,0.5)]",
    },
    {
      id: "x",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-5 h-5"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932L18.901 1.153ZM17.61 20.644h2.039L6.486 3.24H4.298l13.312 17.404Z" />
        </svg>
      ),
      url: ensureAbsoluteUrl(socialLinks?.x),
      className: "bg-[#0f1419] text-white border-transparent hover:shadow-[0_8px_30px_-8px_rgba(0,0,0,0.5)]",
    },
    {
      id: "youtube",
      icon: <Youtube className="w-6 h-6" />,
      url: ensureAbsoluteUrl(socialLinks?.youtube),
      className: "bg-[#FF0000] text-white border-transparent hover:shadow-[0_8px_20px_-8px_#FF0000]",
    },
  ].filter((social) => social.url);

  return (
    <section className="py-10 px-10 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center space-y-2 mb-12">
          <h4 className="text-blue-500 font-bold uppercase tracking-widest text-xs">
            Moments & Memories
          </h4>
          <h2 className="text-4xl font-bold text-blue-900">Gallery & Videos</h2>
        </div>
        <ClientGallery gallery={gallery} categories={categories} />

        {socials.length > 0 && (
          <div className="mt-16 text-center space-y-6">
            <p className="text-blue-500 font-semibold tracking-wide uppercase text-lg">
              Want to see more? Follow us on social media!
            </p>
            <div className="flex justify-center gap-6">
              {socials.map((social) => (
                <a
                  key={social.id}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-3 rounded-full border shadow-sm transition-all duration-300 transform hover:scale-110 active:scale-95 flex items-center justify-center ${social.className}`}
                  title={`Follow us on ${social.id}`}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default GalleryHomeSection;
