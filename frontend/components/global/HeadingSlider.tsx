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

  // No media: render a plain title section with no background
  if (media.length === 0) {
    return (
      <div className="w-full py-14 px-6 border-b border-gray-50">
        <div className="w-full max-w-4xl mx-auto text-center">
          <h1 className={`text-3xl md:text-5xl font-bold tracking-tight font-poppins mb-3 ${className || "text-primary"}`}>
            {title}
          </h1>
          <div className="font-semibold text-black tracking-wider text-sm md:text-base">
            {subtitle}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[380px] md:h-[550px] overflow-hidden bg-gray-950">
      {/* Background Slider */}
      <div className="absolute inset-0">
        {media.map((item, idx) => (
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
                  src={(() => {
                    try {
                      const url = new URL(item.url);
                      const videoId = url.pathname.split("/").pop();
                      url.searchParams.set("autoplay", "1");
                      url.searchParams.set("mute", "1");
                      url.searchParams.set("controls", "0");
                      url.searchParams.set("loop", "1");
                      url.searchParams.set("playlist", videoId || "");
                      url.searchParams.set("rel", "0");
                      url.searchParams.set("showinfo", "0");
                      return url.toString();
                    } catch (e) {
                      return item.url;
                    }
                  })()}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] pointer-events-none border-none"
                  allow="autoplay; encrypted-media"
                  title={`Banner video ${idx + 1}`}
                />
              </div>
            )}
            {/* Overlay to ensure readability and prevent interactions if needed */}
            <div className="absolute inset-0 bg-black/30 z-20" />
          </div>
        ))}
      </div>

      {/* Title & Subtitle - Centered on Top */}
      <div className="w-full absolute inset-0 flex items-center justify-center z-30 px-6">
        <div className="w-full max-w-4xl text-center [text-shadow:_0_2px_8px_rgba(0,0,0,0.5)]">
          <h1 className={`text-3xl md:text-5xl font-bold tracking-tight font-poppins mb-3 ${className || "text-white"}`}>
            {title}
          </h1>
          <div className="font-semibold text-white/90 tracking-wider text-sm md:text-base">
            {subtitle}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeadingSlider;
