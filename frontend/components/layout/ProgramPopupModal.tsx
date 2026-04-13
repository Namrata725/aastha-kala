"use client";

import React from "react";
import { X } from "lucide-react";

interface Schedule {
  id: number;
  start_time: string;
  end_time: string;
  instructor?: { name: string };
}

interface Program {
  id: number;
  title: string;
  description?: string;
  image?: string;
  speciality?: string[];
  is_active: boolean;
  schedules?: Schedule[];
}

interface ProgramPopupModalProps {
  program: Program;
  onClose: () => void;
  onBook: () => void;
}

const ProgramPopupModal: React.FC<ProgramPopupModalProps> = ({
  program,
  onClose,
  onBook,
}) => {
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-white rounded-3xl overflow-hidden max-w-4xl w-full shadow-2xl transform transition-all animate-in fade-in zoom-in duration-300">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 backdrop-blur-sm text-gray-500 hover:text-black transition-all shadow-sm"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex flex-col md:flex-row">
          {/* Image Section */}
          <div className="md:w-2/5 h-64 md:h-auto relative overflow-hidden">
            {program.image ? (
              <img
                src={program.image}
                alt={program.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                <span className="text-6xl font-black text-primary/20">
                  {program.title.charAt(0)}
                </span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:hidden" />
          </div>

          {/* Content Section */}
          <div className="md:w-3/5 p-8 flex flex-col">
            <div className="mb-6">
              <h2 className="text-3xl font-extrabold text-primary font-poppins tracking-tight">
                {program.title}
              </h2>
              <div className="w-20 h-1 bg-secondary rounded-full mt-2" />
            </div>

            <div className="flex-1 text-lg text-gray-600 leading-relaxed mb-8">
              {program.description ? (
                <p className="text-justify whitespace-pre-line">{program.description}</p>
              ) : (
                <p className="italic text-gray-400">
                  Explore this exciting program and develop new skills at Aastha Kala Kendra.
                </p>
              )}
            </div>

            {/* Specialities if any */}
            {program.speciality && program.speciality.length > 0 && (
              <div className="mb-8">
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">
                  What you will learn
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {program.speciality.map((s, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0" />
                      <span className="text-sm font-medium">{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-auto pt-6 border-t border-gray-100">
              <button
                onClick={onBook}
                className="w-full md:w-auto px-10 py-4 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl hover:opacity-90 transition active:scale-95 shadow-lg shadow-primary/20 text-sm uppercase tracking-widest"
              >
                Book Your Class
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgramPopupModal;
