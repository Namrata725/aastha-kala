"use client";

import React, { useEffect, useState } from "react";
import { X, User } from "lucide-react";
import { to12h } from "@/lib/timeFormat";

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
  const IMAGE_BASE = process.env.NEXT_PUBLIC_IMAGE_URL;
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    if (!instructor?.image) {
      setPreviewImage(null);
      return;
    }

    const img = instructor.image;

    if (typeof img === "string") {
      const url = img.startsWith("http") ? img : `${IMAGE_BASE}/${img}`;
      setPreviewImage(url);
    } else if (img?.url) {
      setPreviewImage(img.url);
    }
  }, [instructor]);

  if (!isOpen || !instructor) return null;

  const Field = ({
    label,
    children,
  }: {
    label: string;
    children: React.ReactNode;
  }) => (
    <div className="p-px rounded-xl bg-linear-to-r from-primary/20 to-secondary/20">
      <div className="rounded-xl px-4 py-3 bg-primary/10 backdrop-blur-md border border-primary/10 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
        <p className="text-sm text-primary font-semibold mb-1">{label}</p>
        <div className="text-white/90">{children}</div>
      </div>
    </div>
  );

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-white/5 backdrop-blur-lg flex items-center justify-center z-50 hide-scrollbar cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className=" border border-primary/20 backdrop-blur-md w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto hide-scrollbar rounded-xl p-6 relative space-y-4 bg-white/40 cursor-default"
      >
        {/* Close Button */}
        <button onClick={onClose} className="absolute right-4 top-4 text-white">
          <X />
        </button>

        <h2 className="text-xl font-bold mb-2 text-primary">
          Instructor Details
        </h2>

        {/* Profile */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-28 h-28 rounded-full overflow-hidden border border-primary/20 bg-primary/5 flex items-center justify-center">
            {previewImage ? (
              <img
                src={previewImage}
                alt={instructor.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-10 h-10 text-primary/40" />
            )}
          </div>

          <h3 className="text-lg font-semibold text-primary">
            {instructor.name}
          </h3>

          {instructor.title && (
            <p className="text-secondary/70">{instructor.title}</p>
          )}
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Email">{instructor.email || "—"}</Field>
          <Field label="Phone">{instructor.phone || "—"}</Field>
          <Field label="Facebook">
            <span className="break-all">{instructor.facebook_url || "—"}</span>
          </Field>
          <Field label="Instagram">
            <span className="break-all">{instructor.instagram_url || "—"}</span>
          </Field>
        </div>

        {/* About */}
        <Field label="About">
          <div className="max-h-40 overflow-y-auto hide-scrollbar pr-2">
            <p className="whitespace-pre-wrap">
              {instructor.about || " "}
            </p>
          </div>
        </Field>

        {/* Availability Schedule */}
        {(instructor as any).availabilities?.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-primary mb-3 italic">Free Hours / Availability</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(instructor as any).availabilities.map((avail: any, i: number) => (
                <div key={i} className="flex items-center justify-between bg-white/40 border border-primary/20 rounded-xl px-4 py-3 shadow-sm hover:border-primary/40 transition">
                  <span className="text-xs font-black text-primary uppercase tracking-widest italic">Daily</span>
                  <span className="text-xs font-bold text-secondary italic">
                    {to12h(avail.start_time)} – {to12h(avail.end_time)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        {(instructor as any).availabilities?.length === 0 && (
          <div className="text-center py-6 border-2 border-dashed border-primary/10 rounded-xl bg-white/20">
            <p className="text-xs text-primary/30 font-black uppercase tracking-widest italic">No availability slots defined</p>
          </div>
        )}

        {/* Programs Section */}
        {(instructor as any).programs?.length > 0 && (
          <div className="pt-4 border-t border-primary/10">
            <p className="text-sm font-semibold text-primary mb-3 italic">Programs Taught</p>
            <div className="flex flex-wrap gap-2">
              {(instructor as any).programs.map((program: any, i: number) => (
                <span key={i} className="px-3 py-1.5 bg-secondary/10 text-secondary border border-secondary/20 rounded-lg text-[10px] font-black uppercase tracking-widest italic shadow-sm hover:scale-105 transition-transform duration-200">
                  {program.title}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorViewModal;
