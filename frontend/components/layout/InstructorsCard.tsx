"use client";

import { Facebook, Instagram } from "lucide-react";
import React, { useState } from "react";

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

const InstructorsCard = ({ instructor }: { instructor: Instructor }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 flex gap-4 items-stretch hover:shadow-md transition">
      {/* Left Image */}
      <div className="w-60 h-60 shrink-0 rounded-xl overflow-hidden bg-gray-100">
        {instructor.image ? (
          <img
            src={instructor.image}
            alt={instructor.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            No Image
          </div>
        )}
      </div>

      {/* Right Content */}
      <div className="flex-1 flex flex-col h-full min-h-60">
        {/* Top Content */}
        <div>
          {/* Name */}
          <h3 className="text-lg font-semibold text-gray-800">
            {instructor.name}
          </h3>

          {/* Title */}
          {instructor.title && (
            <p className="text-sm text-gray-500 mb-2">{instructor.title}</p>
          )}

          {/* About */}
          {instructor.about && (
            <div>
              <p className="text-sm text-gray-700 mb-1">
                {expanded
                  ? instructor.about
                  : instructor.about.length > 150
                    ? instructor.about.slice(0, 150) + "..."
                    : instructor.about}
              </p>

              {instructor.about.length > 150 && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="text-blue-500 text-xs hover:underline"
                >
                  {expanded ? "See less" : "See more"}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Social Icons (Always Bottom) */}
        <div className="mt-auto flex gap-3 items-center pt-3">
          {instructor.facebook_url && (
            <a
              href={instructor.facebook_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Facebook className="p-1.5 w-8 h-8 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition" />
            </a>
          )}

          {instructor.instagram_url && (
            <a
              href={instructor.instagram_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Instagram className="p-1.5 w-8 h-8 rounded-full bg-pink-100 text-pink-500 hover:bg-pink-200 transition" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstructorsCard;
