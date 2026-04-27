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
      className="group cursor-pointer flex flex-col items-center transition-all duration-500 hover:-translate-y-3"
    >
      {/* Circular Image Container */}
      <div className="relative w-36 h-36 md:w-44 md:h-44 mb-8">
        {/* Background decorative elements */}
        <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-tr from-primary/20 to-secondary/20 rotate-6 group-hover:rotate-12 group-hover:scale-105 transition-all duration-700 blur-sm" />
        <div className="absolute inset-0 rounded-[2.5rem] bg-surface group-hover:scale-105 transition-all duration-700" />
        
        {/* Main Image */}
        <div className="relative w-full h-full rounded-[2.2rem] overflow-hidden border-2 border-white shadow-2xl bg-background group-hover:rounded-[1.5rem] transition-all duration-700">
          {instructor.image ? (
            <img
              src={instructor.image}
              alt={instructor.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-primary font-black text-3xl text-center px-4 uppercase tracking-tighter">
              {instructor.name.split(" ")[0]}
            </div>
          )}
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-linear-to-t from-brand-deep/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        {/* Social Badges on Hover */}
        <div className="absolute -bottom-2 right-4 flex gap-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
          <div className="w-8 h-8 rounded-xl bg-surface border border-border flex items-center justify-center text-primary shadow-lg hover:bg-primary hover:text-white transition-colors">
            <Facebook className="w-4 h-4" />
          </div>
          <div className="w-8 h-8 rounded-xl bg-surface border border-border flex items-center justify-center text-secondary shadow-lg hover:bg-secondary hover:text-white transition-colors">
            <Instagram className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Text Content Below */}
      <div className="text-center px-4 w-full">
        <h3 className="text-xl font-black text-text-primary group-hover:text-primary transition-colors tracking-tight truncate w-full">
          {instructor.name}
        </h3>
        {instructor.title && (
          <p className="text-xs font-black text-text-muted uppercase tracking-[0.2em] mt-2 line-clamp-1 opacity-80 group-hover:opacity-100 group-hover:text-secondary transition-all">
            {instructor.title}
          </p>
        )}
      </div>
    </div>
  );
};

export default InstructorsCard;
