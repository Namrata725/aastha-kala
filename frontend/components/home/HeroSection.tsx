import React from "react";
import HeroSlider from "@/components/client/HeroSlider";
import { getYouTubeEmbedUrl } from "@/utils/url";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const IMAGE_URL = process.env.NEXT_PUBLIC_IMAGE_URL;

export type HeroMedia = {
  url: string;
  type: "image" | "video";
};

const fetchHero = async (): Promise<HeroMedia[]> => {
  try {
    const res = await fetch(`${API_URL}/galleries/position/slider-home`, {
      cache: "no-store",
    });
    const data = await res.json();
    
    // Normalize data (backend might return { data: [...] } or just [...])
    const items = Array.isArray(data) ? data : data?.data || [];
    
    const media: HeroMedia[] = [];

    items.forEach((item: any) => {
      if (item.type === "images" && item.images) {
        item.images.forEach((img: string) => {
          let cleanPath = img;
          if (img.startsWith("http")) {
            try {
              const parsed = new URL(img);
              cleanPath = parsed.pathname;
            } catch {}
          }
          const base = IMAGE_URL || "http://localhost:8000/storage/";
          const finalBase = base.endsWith("/") ? base.slice(0, -1) : base;
          const normalizedPath = cleanPath.replace("/storage", "");
          const imgPath = normalizedPath.startsWith("/") ? normalizedPath : `/${normalizedPath}`;
          media.push({
            url: `${finalBase}${imgPath}`,
            type: "image",
          });
        });
      } else if (item.type === "video" && item.video) {
        media.push({
          url: getYouTubeEmbedUrl(item.video),
          type: "video",
        });
      }
    });

    return media;
  } catch (err) {
    console.error("Failed to fetch hero media", err);
  }
  return [];
};

const HeroSection = async () => {
  const heroMedia = await fetchHero();

  if (heroMedia.length === 0) return null;

  return (
    <section className="relative w-full h-[450px] sm:h-[550px] md:h-[650px] lg:h-[750px] bg-brand-deep overflow-hidden">
      {/* ── Hero image/video – Fill entire section ── */}
      <div className="absolute inset-0 z-10">
        <HeroSlider heroMedia={heroMedia} fill />
      </div>

      {/* ── Gradient Overlay (Blend into white) ───────────────── */}
      <div className="absolute inset-x-0 bottom-0 h-32 md:h-48 bg-linear-to-b from-transparent to-white pointer-events-none z-20" />
    </section>
  );
};

export default HeroSection;

