"use client";

import { Facebook, Instagram } from "lucide-react";
import React, { useState } from "react";

interface Instructor {
  id: number;
  name: string;
  title?: string;
  about?: string;
  facebook_url?: string;
  instagram_url?: string;
  email?: string;
  phone?: string;
  image?: string;
}

const ensureAbsoluteUrl = (url?: string) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `https://${url}`;
};

interface InstructorsCardProps {
  instructor: Instructor;
  onClick?: (instructor: Instructor) => void;
}

const InstructorsCard = ({ instructor, onClick }: InstructorsCardProps) => {
  return (
    <div 
      onClick={() => onClick?.(instructor)}
      className="group cursor-pointer flex flex-col items-center transition-all duration-300 hover:-translate-y-2"
    >
      {/* Circular Image Container */}
      <div className="relative w-32 h-32 md:w-36 md:h-36 mb-6">
        {/* Background decorative element */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary/10 to-secondary/10 scale-105 group-hover:scale-110 transition-transform duration-500" />
        
        {/* Main Image */}
        <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white shadow-xl bg-gray-50">
          {instructor.image ? (
            <img
              src={instructor.image}
              alt={instructor.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-primary font-bold text-xl md:text-2xl text-center px-2">
              {instructor.name.split(" ")[0]}
            </div>
          )}
        </div>

        {/* Floating Social Icons (Optional, maybe keep it clean) */}
        {/* <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
           {instructor.facebook_url && (
            <div className="p-1.5 rounded-full bg-[#1877F2] text-white shadow-lg">
              <Facebook className="w-3.5 h-3.5" />
            </div>
           )}
           {instructor.instagram_url && (
            <div className="p-1.5 rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white shadow-lg">
              <Instagram className="w-3.5 h-3.5" />
            </div>
           )}
        </div> */}
      </div>

      {/* Text Content Below */}
      <div className="text-center px-4">
        <h3 className="text-lg md:text-xl font-bold text-gray-900 group-hover:text-primary transition-colors truncate w-full">
          {instructor.name}
        </h3>
        {instructor.title && (
          <p className="text-[10px] md:text-sm font-medium text-primary uppercase tracking-wider mt-1 line-clamp-1">
            {instructor.title}
          </p>
        )}
      </div>
    </div>
  );
};

export default InstructorsCard;
