"use client";

import React, { useState } from "react";
import {
  X,
  CheckCircle2,
  Clock,
  Users,
  Monitor,
  MapPin,
  ChevronDown,
  Lock,
  Calendar,
} from "lucide-react";
import toast from "react-hot-toast";

import BookingModal from "../layout/BookingModal";

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

interface Props {
  programs: Program[];
}

// ─── Program Card ─────────────────────────────────────────────────────────────

function ProgramCard({ program, onBook, index }: { program: Program; onBook: () => void; index: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`flex flex-col ${index % 2 !== 0 ? "md:flex-row-reverse" : "md:flex-row"} gap-0 bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300`}>
      {/* Image */}
      <div className="md:w-80 w-full shrink-0 relative overflow-hidden">
        {program.image ? (
          <img
            src={program.image}
            alt={program.title}
            className="w-full h-56 md:h-full object-cover"
          />
        ) : (
          <img
            src="/images/program-fallback.png"
            alt={program.title}
            className="w-full h-56 md:h-full object-cover"
          />
        )}
        {/* Gradient overlay on image */}
        <div className={`absolute inset-0 bg-gradient-to-${index % 2 !== 0 ? "l" : "r"} from-transparent to-white/20 md:block hidden`} />
      </div>

      {/* Content */}
      <div className="flex-1 p-7 flex flex-col gap-4">
        <div>
          <h2 className="text-2xl font-bold text-primary font-poppins">{program.title}</h2>
          <p className="text-lg text-gray-500 mt-2 leading-relaxed">
            {program.description || "Explore this exciting program and develop new skills."}
          </p>
        </div>

        {/* Specialities */}
        {program.speciality && program.speciality.length > 0 && (
          <div>
            <p className="text-lg font-bold text-gray-600 tracking-widest mb-2">What makes it special:</p>
            <ul className="space-y-1">
              {(expanded ? program.speciality : program.speciality.slice(0, 4)).map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-lg text-black">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="mt-auto">
          <button
            onClick={onBook}
            className="px-8 py-1 bg-gradient-to-r from-primary to-secondary text-white font-bold text-sm rounded-xl hover:opacity-90 transition active:scale-95 shadow-sm shadow-primary/20"
          >
            Book Your Class
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ClientPrograms({ programs }: Props) {
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const activePrograms = programs.filter((p) => p.is_active);

  if (activePrograms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-400">
        <Calendar className="w-14 h-14 mb-4 opacity-30" />
        <p className="text-lg font-medium">No programs available at the moment.</p>
        <p className="text-sm mt-1">Please check back soon!</p>
      </div>
    );
  }

  return (
    <section className="container mx-auto px-4 py-14 max-w-5xl space-y-8">

      {activePrograms.map((program, index) => (
        <ProgramCard
          key={program.id}
          program={program}
          index={index}
          onBook={() => setSelectedProgram(program)}
        />
      ))}

      {selectedProgram && (
        <BookingModal
          program={selectedProgram}
          onClose={() => setSelectedProgram(null)}
        />
      )}
    </section>
  );
}
