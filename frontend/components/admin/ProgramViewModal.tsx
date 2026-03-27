"use client";

import React from "react";
import { X, Clock, User, Users, Calendar } from "lucide-react";

interface ProgramViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  program: any;
}

const ProgramViewModal: React.FC<ProgramViewModalProps> = ({
  isOpen,
  onClose,
  program,
}) => {
  if (!isOpen || !program) return null;

  const Field = ({
    label,
    children,
  }: {
    label: string;
    children: React.ReactNode;
  }) => (
    <div className="p-px rounded-xl bg-linear-to-r from-primary/20 to-secondary/20 h-full">
      <div className="rounded-xl px-4 py-3 bg-white/40 backdrop-blur-md border border-white/10 h-full">
        <p className="text-[10px] text-primary/60 font-black uppercase tracking-widest mb-1 italic">
          {label}
        </p>
        <div className="text-primary font-medium italic">{children}</div>
      </div>
    </div>
  );

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-lg cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto hide-scrollbar rounded-2xl p-8 bg-white/50 relative cursor-default"
        style={{
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-primary/50">
          <h2 className="text-xl font-bold text-primary italic">
            Program Details
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full text-primary/60 hover:text-primary transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-8">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/3">
              {program.image ? (
                <img
                  src={program.image}
                  alt={program.title}
                  className="w-full h-48 rounded-xl object-cover shadow-xl border border-primary/20 bg-white/40 p-1"
                />
              ) : (
                <div className="w-full h-48 rounded-xl bg-white/40 border border-primary/20 flex items-center justify-center text-primary/20 uppercase text-[10px] font-black tracking-widest italic">
                  No Image
                </div>
              )}
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-primary italic tracking-tight">
                  {program.title}
                </h3>
                <div
                  className={`inline-block px-3 py-1 mt-2 rounded-full text-[10px] uppercase font-black tracking-widest italic ${
                    program.is_active
                      ? "bg-green-500/10 text-green-600 border border-green-500/20"
                      : "bg-red-500/10 text-red-600 border border-red-500/20"
                  }`}
                >
                  {program.is_active ? "Active" : "Inactive"}
                </div>
              </div>
              <div className="bg-white/40 p-4 rounded-xl border border-primary/10 italic">
                <p className="text-sm text-primary/80 leading-relaxed font-medium">
                  {program.description || "No description provided."}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Key Specialities">
              <div className="flex flex-wrap gap-2 py-1">
                {program.speciality?.map((spec: string, i: number) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-primary/10 border border-primary/10 rounded-full text-[10px] text-primary font-bold uppercase tracking-tight"
                  >
                    {spec}
                  </span>
                ))}
                {!program.speciality?.length && (
                  <span className="text-xs text-primary/30 italic">
                    No specialities listed.
                  </span>
                )}
              </div>
            </Field>

            <div className="hidden md:block">{/* Spacer */}</div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-black text-primary/60 uppercase tracking-[0.2em] flex items-center gap-2 italic">
              <Calendar className="w-3.5 h-3.5 text-primary" /> Fixed Class
              Schedules
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {program.schedules?.map((s: any, i: number) => (
                <div
                  key={i}
                  className="bg-white/40 border border-primary/10 rounded-xl p-5 space-y-4 shadow-sm group hover:border-primary/40 transition duration-300 relative overflow-hidden"
                >
                  <div className="flex justify-between items-center border-b border-primary/10 pb-3">
                    <div className="flex items-center gap-1.5 text-primary italic">
                      <Clock className="w-3.5 h-3.5 text-secondary" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                        {s.start_time?.substring(0, 5)} -{" "}
                        {s.end_time?.substring(0, 5)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-primary/5 px-3 py-2 rounded-lg border border-primary/10 w-fit">
                    <User className="w-3.5 h-3.5 text-secondary" />
                    <span className="text-xs font-bold text-primary uppercase tracking-tight truncate italic">
                      {s.instructor?.name || "Unassigned"}
                    </span>
                  </div>
                </div>
              ))}
              {!program.schedules?.length && (
                <p className="text-xs text-primary/30 italic col-span-2 py-8 border-2 border-dashed border-primary/10 rounded-2xl text-center bg-white/20 uppercase tracking-widest font-bold">
                  No schedules defined
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t border-primary/20">
            <button
              onClick={onClose}
              className="px-10 py-3 bg-linear-to-r from-primary to-secondary text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:opacity-90 transition active:scale-95 shadow-xl shadow-primary/20 italic"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgramViewModal;
