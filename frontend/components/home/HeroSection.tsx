import React from "react";
import HeroSlider from "@/components/client/HeroSlider";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const IMAGE_URL = process.env.NEXT_PUBLIC_IMAGE_URL;

const fetchHero = async (): Promise<string[]> => {
  try {
    const res = await fetch(`${API_URL}/galleries/position/slider-home`, {
      next: { revalidate: 3600 },
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
        return `${IMAGE_URL}${img}`;
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
    <section className="relative w-full min-h-[480px] md:min-h-[580px] bg-brand-deep flex flex-col items-center justify-start overflow-hidden">
      {/* ── "AASTHA KALA" watermark text ──────────────────────────────── */}
      <div className="absolute inset-0 flex items-start justify-center pt-6 select-none pointer-events-none z-0">
        <h1
          className="text-[3.5rem] sm:text-[5rem] md:text-[8rem] lg:text-[10rem] font-extrabold text-white/15 tracking-[0.25em] leading-none whitespace-nowrap"
          style={{ fontFamily: "'Montserrat', 'Poppins', sans-serif" }}
        >
          AASTHA KALA
        </h1>
      </div>

      {/* ── Hero image – fills from near-top to bottom edge, no card rounding ── */}
      <div className="relative z-10 w-full h-full flex-1 flex flex-col items-center justify-end px-0">
        <HeroSlider heroImages={heroImages} />
      </div>

      {/* ── Simple linear Blend (Removes crisp line) ───────────────── */}
      <div className="absolute inset-x-0 bottom-0 h-32 md:h-48 bg-linear-to-b from-transparent to-white pointer-events-none z-20" />
    </section>
  );
};

export default HeroSection;
