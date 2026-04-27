"use client";

import React, { useEffect, useState } from "react";
import InstructorsCard from "@/components/layout/InstructorsCard";

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

const InstructorSection = () => {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/instructors`
        );
        const result = await res.json();

        const list = result?.data?.data ?? result?.data ?? [];
        setInstructors(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error("Failed to fetch instructors", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInstructors();
  }, []);

  if (loading) {
    return (
      <section className="bg-white px-10 py-10">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-500">Loading instructors...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white px-10 py-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center space-y-4 mb-20 relative">
          <div className="absolute left-1/2 -top-10 -translate-x-1/2 w-40 h-40 bg-secondary/5 rounded-full blur-3xl" />
          <h2 className="text-4xl md:text-5xl font-black text-gradient tracking-tight relative z-10">
            Meet Our Instructors
          </h2>
          <p className="text-text-muted text-base max-w-2xl mx-auto font-medium relative z-10">
            Learn from industry professionals who are dedicated to your artistic success and creative growth.
          </p>
        </div>

        {/* ONE ROW GRID (2x2 on mobile, 4 in a row on desktop) */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {instructors.slice(0, 4).map((inst) => (
            <InstructorsCard key={inst.id} instructor={inst} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default InstructorSection;