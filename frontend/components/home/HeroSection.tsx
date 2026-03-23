"use client";

import React, { useEffect, useState } from "react";

const HeroSection = () => {
  const [heroImages, setHeroImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchHero = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/galleries/position/slider-home`
        );
        const data = await res.json();
        if (
          data &&
          data.length > 0 &&
          data[0].images &&
          data[0].images.length > 0
        ) {
          const normalizedImages = data[0].images.map((img: string) => {
            if (img.startsWith("http")) return img;
            return `${process.env.NEXT_PUBLIC_IMAGE_URL}${img}`;
          });
          setHeroImages(normalizedImages);
        }
      } catch (err) {
        console.error("Failed to fetch hero images", err);
      }
    };
    fetchHero();
  }, []);

  // Auto-transitioning slider
  useEffect(() => {
    if (heroImages.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroImages]);

  return (
    // Outer wrapper: deep blue background
    <section className="relative w-full min-h-[480px] md:min-h-[580px] bg-[#1B2A6B] flex flex-col items-center justify-start overflow-hidden">

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
        {heroImages.length > 0 ? (
          <div className="relative w-full overflow-hidden" style={{ aspectRatio: "3/1.3", minHeight: 320 }}>
            {heroImages.map((img, idx) => (
              <img
                key={img}
                src={img}
                alt={`Aastha Kala group ${idx + 1}`}
                className={`absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-1000 ease-in-out ${
                  idx === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                }`}
              />
            ))}

            {/* Subtle theme-color vignette at very bottom to blend into stats */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#1B2A6B] to-transparent z-20 pointer-events-none" />

            {/* Pagination dots */}
            {heroImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-30">
                {heroImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      idx === currentIndex ? "bg-white w-6" : "bg-white/50 w-2"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          // Skeleton / loading state
          <div className="w-full bg-white/5 backdrop-blur-sm flex items-center justify-center text-white/30 text-base font-medium" style={{ aspectRatio: "3/1.3", minHeight: 320 }}>
            Fetching Banner...
          </div>
        )}
      </div>

      {/* ── Simple Gradient Blend (Removes crisp line) ───────────────── */}
      <div className="absolute inset-x-0 bottom-0 h-32 md:h-48 bg-gradient-to-b from-transparent to-white pointer-events-none z-20" />
    </section>
  );
};

export default HeroSection;