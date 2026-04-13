import React from "react";
import HeroSlider from "@/components/client/HeroSlider";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const IMAGE_URL = process.env.NEXT_PUBLIC_IMAGE_URL;

const fetchHero = async (): Promise<string[]> => {
  try {
    const res = await fetch(`${API_URL}/galleries/position/slider-home`, {
      cache: "no-store",
    });
    const data = await res.json();
    if (
      data &&
      data.length > 0 &&
      data[0].images &&
      data[0].images.length > 0
    ) {
      return data[0].images.map((img: string) => {
        if (img.startsWith("http")) return img;
        const base = IMAGE_URL || "";
        const baseUrl = base.endsWith("/") ? base.slice(0, -1) : base;
        const imgPath = img.startsWith("/") ? img : `/${img}`;
        return `${baseUrl}${imgPath}`;
      });
    }
  } catch (err) {
    console.error("Failed to fetch hero images", err);
  }
  return [];
};

const HeroSection = async () => {
  const heroImages = await fetchHero();

  if (heroImages.length === 0) return null;

  return (
    <section className="relative w-full h-[450px] sm:h-[550px] md:h-[650px] lg:h-[750px] bg-brand-deep overflow-hidden">
      {/* ── Hero image – Fill entire section ── */}
      <div className="absolute inset-0 z-10">
        <HeroSlider heroImages={heroImages} fill />
      </div>

      {/* ── "AASTHA KALA" watermark text ──────────────────────────────── */}
      <div className="absolute inset-0 flex items-start justify-center pt-8 md:pt-12 select-none pointer-events-none z-20">
        <h1
          className="text-[3rem] sm:text-[5rem] md:text-[8rem] lg:text-[10rem] font-extrabold text-white/10 tracking-[0.25em] leading-none whitespace-nowrap"
          style={{ fontFamily: "'Montserrat', 'Poppins', sans-serif" }}
        >
          AASTHA KALA
        </h1>
      </div>

      {/* ── Gradient Overlay (Blend into white) ───────────────── */}
      <div className="absolute inset-x-0 bottom-0 h-32 md:h-48 bg-linear-to-b from-transparent to-white pointer-events-none z-20" />
    </section>
  );
};

export default HeroSection;
