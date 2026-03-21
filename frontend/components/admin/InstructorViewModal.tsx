"use client";

import React from "react";
import { X, User, Mail, Phone, Facebook, Instagram } from "lucide-react";

interface Instructor {
  id?: number;
  name: string;
  title?: string;
  about?: string;
  email?: string;
  phone?: string;
  facebook_url?: string;
  instagram_url?: string;
  image?: any;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  instructor: Instructor | null;
}

const InstructorViewModal: React.FC<Props> = ({
  isOpen,
  onClose,
  instructor,
}) => {
  if (!isOpen || !instructor) return null;

  const getImageUrl = (image: any) => {
    if (!image) return null;

    if (typeof image === "string") {
      if (image.startsWith("http")) return image;

      const base = process.env.NEXT_PUBLIC_IMAGE_URL?.replace(/\/$/, "");
      if (!base) return null;

      const cleanPath = image.startsWith("/") ? image.slice(1) : image;
      return `${base}/${cleanPath}`;
    }

    if (typeof image === "object" && image.url) {
      return image.url;
    }

    return null;
  };

  const imageUrl = getImageUrl(instructor.image);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-lg overflow-y-auto hide-scrollbar py-6">
      {/* Modal */}
      <div
        className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto hide-scrollbar rounded-2xl p-8"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.05), rgba(0,0,0,0.2))",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-primary/30">
          <h2 className="text-lg font-bold text-primary">Instructor Details</h2>

          <button onClick={onClose} className="p-1">
            <X className="text-white/90 hover:text-white" />
          </button>
        </div>

        {/* Profile Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-28 h-28 rounded-full border border-primary/20 overflow-hidden bg-primary/5 flex items-center justify-center">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={instructor.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-10 h-10 text-primary/40" />
            )}
          </div>

          <h3 className="mt-3 text-xl font-semibold text-primary">
            {instructor.name}
          </h3>

          {instructor.title && (
            <p className=" text-secondary/60">{instructor.title}</p>
          )}
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
          {/* Email */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
            <Mail className="w-4 h-4 text-primary" />
            <span className="text-primary/80">{instructor.email || "N/A"}</span>
          </div>

          {/* Phone */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
            <Phone className="w-4 h-4 text-primary" />
            <span className="text-primary/80">{instructor.phone || "N/A"}</span>
          </div>

          {/* Facebook */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
            <Facebook className="w-4 h-4 text-primary" />
            <span className="text-primary/80 break-all">
              {instructor.facebook_url || "N/A"}
            </span>
          </div>

          {/* Instagram */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
            <Instagram className="w-4 h-4 text-primary" />
            <span className="text-primary/80 break-all">
              {instructor.instagram_url || "N/A"}
            </span>
          </div>
        </div>

        {/* About Section */}
        <div className="mt-6">
          <h4 className="text-sm font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
            About
          </h4>

          <div className="p-4 rounded-lg bg-primary/5 border border-white/10 text-primary/80 text-sm leading-relaxed">
            {instructor.about || "No description available."}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end mt-8 pt-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg text-white bg-gradient-to-r from-primary to-secondary"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstructorViewModal;
