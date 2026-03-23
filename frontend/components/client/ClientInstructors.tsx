"use client";

import React from "react";
import InstructorsCard from "../layout/InstructorsCard";
import { Users } from "lucide-react";

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

interface Props {
  instructors: Instructor[];
}

const ClientInstructors = ({ instructors }: Props) => {
  if (!instructors || instructors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-500">
        <Users className="w-12 h-12 animate-bounce text-secondary" />
        <p className="text-lg font-medium mt-3">No instructors found</p>
        <p className="text-sm mt-2">Please check back later for updates</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-7xl">
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-6">
        {instructors.map((instructor) => (
          <InstructorsCard key={instructor.id} instructor={instructor} />
        ))}
      </div>
    </div>
  );
};

export default ClientInstructors;
