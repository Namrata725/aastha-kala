"use client";

import { useState } from "react";
import InstructorsCard from "../layout/InstructorsCard";
import InstructorDetailModal from "../layout/InstructorDetailModal";
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
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleInstructorClick = (instructor: Instructor) => {
    setSelectedInstructor(instructor);
    setIsModalOpen(true);
  };

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
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-12 gap-x-4 md:gap-x-8 justify-items-center">
        {instructors.map((instructor) => (
          <InstructorsCard 
            key={instructor.id} 
            instructor={instructor} 
            onClick={handleInstructorClick}
          />
        ))}
      </div>

      <InstructorDetailModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        instructor={selectedInstructor}
      />
    </div>
  );
};

export default ClientInstructors;
