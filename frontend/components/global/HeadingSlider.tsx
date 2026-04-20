"use client";

import React, { useState, useEffect } from "react";


interface HeadingSliderProps {
  title: string;
  subtitle: React.ReactNode;
  media: { url: string; type: "image" | "video" }[];
  className?: string;
}

const HeadingSlider = ({ title, subtitle, media, className }: HeadingSliderProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (media.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % media.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [media]);

  return (
    <div className="relative w-full h-[350px] md:h-[450px] overflow-hidden bg-brand-deep">
      {/* Background Slider */}
      <div className="absolute inset-0">
        {media.length > 0 ? (
          media.map((item, idx) => (
            <div
              key={`${item.url}-${idx}`}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                idx === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              {item.type === "image" ? (
                <img
                  src={item.url}
                  alt={title || "Banner"}
                  className="absolute inset-0 w-full h-full object-cover object-top"
                />
              ) : (
                <div className="w-full h-full relative overflow-hidden">
                   <iframe
                    src={`${item.url}?autoplay=1&mute=1&controls=0&loop=1&playlist=${item.url.split("/").pop()}&rel=0&showinfo=0`}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] pointer-events-none"
                    allow="autoplay; encrypted-media"
                    title={`Banner video ${idx + 1}`}
                  />
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="w-full h-full bg-blue-900" />
        )}
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-x-0 bottom-0 h-48 bg-linear-to-t from-white via-white/40 to-transparent pointer-events-none z-20" />

      {/* Title & Subtitle */}
      <div className="w-full absolute inset-0 flex items-end justify-center z-30 pb-12 px-6">
        <div className="w-full max-w-4xl text-center">
          <h1 className={`text-3xl md:text-5xl font-bold tracking-tight font-poppins mb-3 ${className || "text-[#27A0CF]"}`}>
            {title}
          </h1>
          <div className="font-semibold text-[#27A0CF] tracking-wider text-sm md:text-base uppercase">
            {subtitle}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeadingSlider;
