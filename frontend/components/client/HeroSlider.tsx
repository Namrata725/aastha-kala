"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

interface HeroSliderProps {
  heroImages: string[];
  fill?: boolean;
}

const HeroSlider: React.FC<HeroSliderProps> = ({ heroImages, fill = false }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-transitioning slider
  useEffect(() => {
    if (heroImages.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroImages]);

  return (
    <div
      className={`relative w-full overflow-hidden ${fill ? "h-full" : ""}`}
      style={!fill ? { aspectRatio: "3/1.6", minHeight: 400 } : {}}
    >
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
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-brand-deep to-transparent z-20 pointer-events-none" />

      {/* Pagination dots */}
      {heroImages.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-30 text-white text-lg font-bold">
          {heroImages.map((_, idx) => (
            <span
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`cursor-pointer transition-all duration-300 ${
                idx === currentIndex ? "opacity-100" : "opacity-50"
              }`}
            >
              {idx === currentIndex ? "-" : "."}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroSlider;
