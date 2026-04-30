"use client";

import React from "react";
import { motion } from "framer-motion";
import { Facebook, Instagram, Mail, Linkedin, Twitter } from "lucide-react";

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

interface InstructorsCardProps {
  instructor: Instructor;
  onClick?: (instructor: Instructor) => void;
}

const InstructorsCard = ({ instructor, onClick }: InstructorsCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onClick={() => onClick?.(instructor)}
      className="group relative bg-white rounded-2xl border border-gray-100 flex flex-col h-full hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] transition-all duration-500 cursor-pointer overflow-hidden shadow-sm min-h-[480px]"
    >
      {/* 1. TOP SECTION - IMAGE (Square-ish with subtle rounding) */}
      <div className="relative h-64 w-full overflow-hidden bg-gray-50 border-b border-gray-50">
        {instructor.image ? (
          <img
            src={instructor.image}
            alt={instructor.name}
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-blue-50 text-primary text-5xl font-black font-poppins">
            {instructor.name.charAt(0)}
          </div>
        )}
      </div>

      {/* 2. CONTENT SECTION - POPPINS & PRIMARY NAME */}
      <div className="flex-1 flex flex-col items-center p-8 text-center font-poppins">
        {/* Name in Primary Color */}
        <h3 className="text-primary text-2xl font-black  mb-1">
          {instructor.name}
        </h3>
        
        {/* Profession (Title) */}
        {instructor.title && (
          <p className="text-[#001f54] text-[13px] font-poppins font-medium mb-6 opacity-100">
            {instructor.title}
          </p>
        )}

        {/* Description */}
        <p className="text-gray-500 text-[13px] leading-relaxed font-medium line-clamp-4">
          {instructor.about || "Dedicated professional committed to nurturing artistic excellence and creative growth through expert mentorship."}
        </p>
      </div>
    </motion.div>
  );
};

export default InstructorsCard;
