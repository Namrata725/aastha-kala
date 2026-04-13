"use client";

import React, { useState, useEffect } from "react";

interface HeadingSliderProps {
  title: string;
  subtitle: React.ReactNode;
  images: string[];
}

const HeadingSlider = ({ title, subtitle, images }: HeadingSliderProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [images]);

  return (
    <div className="relative w-full h-[350px] md:h-[450px] overflow-hidden bg-gray-100">
      {/* Background Slider */}
      <div className="absolute inset-0">
        {images.length > 0 ? (
          images.map((img, idx) => (
            <img
              key={img}
              src={img}
              alt={title}
              className={`absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-1000 ease-in-out ${
                idx === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            />
          ))
        ) : (
          <div className="w-full h-full bg-blue-900" />
        )}
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-linear-to-t from-white via-white/20 to-transparent z-20" />

      {/* Title & Subtitle */}
      <div className="w-full absolute inset-0 flex items-end justify-center z-30 pb-12 px-6">
        <div className="w-full max-w-4xl text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-blue-900 tracking-tight font-poppins mb-3">
            {title}
          </h1>
          <div className="font-semibold text-blue-700 tracking-wider text-sm md:text-base uppercase">
            {subtitle}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeadingSlider;
