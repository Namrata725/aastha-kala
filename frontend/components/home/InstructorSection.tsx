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
          `${process.env.NEXT_PUBLIC_API_URL}/instructors`,
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

  return (
    <section className="bg-white ms:px-4 md:px-10 py-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center space-y-4 mb-10 md:mb-20 relative z-0">
          <div className="absolute left-1/2 -top-10 -translate-x-1/2 w-40 h-40 bg-secondary/5 rounded-full blur-3xl" />
          <h2 className="text-4xl md:text-5xl font-black text-gradient tracking-tight relative z-10 font-poppins">
            Meet Our Instructors
          </h2>
          <p className="text-text-muted text-base max-w-2xl mx-auto font-medium relative z-10 font-poppins">
            Learn from industry professionals who are dedicated to your artistic
            success and creative growth.
          </p>
        </div>

        {/* INSTRUCTOR GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 items-stretch">
          {instructors.slice(0, 4).map((inst) => (
            <InstructorsCard key={inst.id} instructor={inst} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default InstructorSection;
