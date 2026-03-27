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
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/instructors`);
        const result = await res.json();
        const list = result.data?.data || result.data || [];
        setInstructors(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error("Failed to fetch instructors", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInstructors();
  }, []);

  if (loading) return null;

  return (
    <section className="bg-white px-10 py-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center space-y-2 mb-16">
          <h2 className="text-4xl font-bold text-blue-900">Meet Our Instructors</h2>
          <h4 className="text-secondary text-sm max-w-2xl mx-auto">
            Learn from industry professional music and art and taking artist and director for your success.
          </h4>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {instructors.slice(0, 4).map((inst) => (
            <InstructorsCard key={inst.id} instructor={inst} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default InstructorSection;
