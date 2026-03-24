"use client";

import React from "react";
import Link from "next/link";

interface AboutHomeSectionProps {
  settings: any;
  gallery?: any;
}

const AboutHomeSection: React.FC<AboutHomeSectionProps> = ({ settings, gallery }) => {
  const displayImage = gallery?.images?.[0] || settings?.banner || "https://images.unsplash.com/photo-1547153760-18fc20293116?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80";

  return (
    <section className="py-4 md:py-32 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center gap-16">
          {/* Left: Text Content */}
          <div className="w-full md:w-1/2 space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-[#2E5BFF]">
              {settings?.company_name || "Aasha Kala Kendra"}
            </h1>
            <h3 className="text-xl md:text-2xl font-semibold text-pink-500 -mt-2">
              Dance & Music School
            </h3>

            <div className="text-gray-600 space-y-4 leading-relaxed text-sm md:text-base">
              {settings?.about_short ? (
                <div
                  dangerouslySetInnerHTML={{ __html: settings.about }}
                  className="text-justify"
                />
              ) : (
                <>
                  <p>
                    Aastha Kala Kendra is a dedicated center for performing arts,
                    believing in nurturing talent and passion in every individual.
                    We offer professional training in various forms of dance and
                    music.
                  </p>
                  <p>
                    Our mission is to provide high-quality education in performing
                    arts while preserving our cultural heritage. Join us on a
                    journey of self-discovery through art.
                  </p>
                </>
              )}
            </div>

            <Link href="/about">
              <button className="mt-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl">
                Read More
              </button>
            </Link>
          </div>

          {/* Right: Image */}
          <div className="w-full md:w-1/2 relative group">
             <div className="absolute -top-6 -right-6 w-48 h-48 bg-pink-100 rounded-full blur-3xl opacity-60 group-hover:opacity-80 transition-opacity" />
             <div className="absolute -bottom-6 -left-6 w-48 h-48 bg-blue-100 rounded-full blur-3xl opacity-60 group-hover:opacity-80 transition-opacity" />
             
             <div className="relative rounded-3xl">
                <img 
                    src={displayImage} 
                    alt="Dancers" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutHomeSection;
