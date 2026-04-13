"use client";

import React from "react";
import { X, Facebook, Instagram, Phone, Mail } from "lucide-react";

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

interface InstructorDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  instructor: Instructor | null;
}

const ensureAbsoluteUrl = (url?: string) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `https://${url}`;
};

const InstructorDetailModal: React.FC<InstructorDetailModalProps> = ({
  isOpen,
  onClose,
  instructor,
}) => {
  if (!isOpen || !instructor) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[150] flex items-center justify-center bg-black/40 backdrop-blur-md p-4 transition-all duration-300"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white rounded-3xl overflow-hidden max-w-2xl w-full shadow-2xl transform transition-all duration-300 animate-in fade-in zoom-in"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 backdrop-blur-sm text-gray-500 hover:text-primary hover:bg-white transition-all shadow-sm"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex flex-col md:flex-row">
          {/* Image Section */}
          <div className="md:w-1/2 h-80 md:h-auto relative">
            {instructor.image ? (
              <img
                src={instructor.image}
                alt={instructor.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                No Image
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:hidden" />
            <div className="absolute bottom-4 left-4 text-white md:hidden">
              <h2 className="text-2xl font-bold">{instructor.name}</h2>
              <p className="text-blue-200">{instructor.title}</p>
            </div>
          </div>

          {/* Content Section */}
          <div className="md:w-1/2 p-8 flex flex-col">
            <div className="hidden md:block mb-6">
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                {instructor.name}
              </h2>
              <p className="text-primary font-semibold text-lg mt-1">
                {instructor.title}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto max-h-60 pr-2 custom-scrollbar text-gray-600 leading-relaxed mb-6">
              {instructor.about ? (
                <p className="whitespace-pre-line text-justify">{instructor.about}</p>
              ) : (
                <p className="italic text-gray-400">No biography available.</p>
              )}
            </div>

            {/* <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                Contact & Social
              </h3>
              
              <div className="flex flex-wrap gap-3">
                {instructor.email && (
                  <a
                    href={`mailto:${instructor.email}`}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl text-gray-600 hover:bg-primary/5 hover:text-primary transition-all border border-gray-100"
                  >
                    <Mail className="w-4 h-4" />
                    <span className="text-sm font-medium">Email</span>
                  </a>
                )}
                {instructor.phone && (
                  <a
                    href={`tel:${instructor.phone}`}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl text-gray-600 hover:bg-primary/5 hover:text-primary transition-all border border-gray-100"
                  >
                    <Phone className="w-4 h-4" />
                    <span className="text-sm font-medium">Call</span>
                  </a>
                )}
              </div>

              <div className="flex gap-4">
                {instructor.facebook_url && (
                  <a
                    href={ensureAbsoluteUrl(instructor.facebook_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-[#1877F2] text-white hover:scale-110 transition-transform shadow-md"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                )}
                {instructor.instagram_url && (
                  <a
                    href={ensureAbsoluteUrl(instructor.instagram_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white hover:scale-110 transition-transform shadow-md"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorDetailModal;
