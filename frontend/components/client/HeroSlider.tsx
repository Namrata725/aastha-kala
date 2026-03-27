"use client";

import React, { useState, useEffect } from "react";

interface HeroSliderProps {
  heroImages: string[];
}

const HeroSlider: React.FC<HeroSliderProps> = ({ heroImages }) => {
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
      className="relative w-full overflow-hidden"
      style={{ aspectRatio: "3/1.6", minHeight: 400 }}
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
  );
};

export default HeroSlider;
