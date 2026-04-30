"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

export type HeroMedia = {
  url: string;
  type: "image" | "video";
};

interface HeroSliderProps {
  heroMedia: HeroMedia[];
  fill?: boolean;
}

const HeroSlider: React.FC<HeroSliderProps> = ({ heroMedia, fill = false }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-transitioning slider
  useEffect(() => {
    if (heroMedia.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroMedia.length);
    }, 8000); // Slightly longer for video visibility
    return () => clearInterval(timer);
  }, [heroMedia]);

  return (
    <div
      className={`relative w-full overflow-hidden ${fill ? "h-full" : ""}`}
      style={!fill ? { aspectRatio: "3/1.6", minHeight: 400 } : {}}
    >
      {heroMedia.map((media, idx) => (
        <div
          key={`${media.url}-${idx}`}
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
            idx === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          {media.type === "image" ? (
            <img
              src={media.url}
              alt={`Hero media ${idx + 1}`}
              className="w-full h-full object-cover object-top"
            />
          ) : (
            <div className="w-full h-full relative overflow-hidden">
               <iframe
                src={`${media.url}?autoplay=1&mute=1&controls=0&loop=1&playlist=${media.url.split("/").pop()}&rel=0&showinfo=0`}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] pointer-events-none"
                allow="autoplay; encrypted-media"
                title={`Hero video ${idx + 1}`}
              />
            </div>
          )}
        </div>
      ))}

      {/* Navigation Arrows */}
      {heroMedia.length > 1 && (
        <>
          <button
            onClick={() => setCurrentIndex((prev) => (prev - 1 + heroMedia.length) % heroMedia.length)}
            className="absolute left-6 top-1/2 -translate-y-1/2 z-40 p-4 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm transition-all duration-300 group cursor-pointer"
            aria-label="Previous slide"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6 transition-transform group-hover:-translate-x-0.5">
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % heroMedia.length)}
            className="absolute right-6 top-1/2 -translate-y-1/2 z-40 p-4 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm transition-all duration-300 group cursor-pointer"
            aria-label="Next slide"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6 transition-transform group-hover:translate-x-0.5">
              <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </>
      )}

      {/* Pagination indicators - Styled as modern dash/dots */}
      {heroMedia.length > 1 && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 z-30">
          {heroMedia.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`transition-all duration-500 rounded-full cursor-pointer h-1.5 ${
                idx === currentIndex
                  ? "w-8 bg-primary shadow-[0_0_10px_rgba(39,160,207,0.5)]"
                  : "w-2 bg-white/30 hover:bg-white/50"
              }`}
              title={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroSlider;

