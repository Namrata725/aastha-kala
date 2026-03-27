import React from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const fetchPrograms = async () => {
  try {
    const res = await fetch(`${API_URL}/programs`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch programs");
    const data = await res.json();
    const programs = data?.data?.data || data?.data || [];
    // We want exactly 3 programs as shown in the mockup
    return programs.slice(0, 3);
  } catch (error) {
    console.error("Failed to fetch programs for home section:", error);
    return [];
  }
};

const HomeProgramSection = async () => {
  const programs = await fetchPrograms();

  if (programs.length === 0) return null;

  return (
    <section className="bg-[#f8fafc] py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-black text-primary font-poppins tracking-tight">
            Our Program
          </h2>
          <h4 className="text-lg md:text-lg text-secondary font-semibold  mx-auto leading-relaxed">
            Comprehensive training programs designed to nurture talent and inspire excellence
          </h4>
        </div>

        {/* Programs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {programs.map((program: any) => (
            <div
              key={program.id}
              className="group relative aspect-[3/2] rounded-[2rem] overflow-hidden shadow-2xl shadow-blue-900/10 transition-all duration-500 hover:-translate-y-2"
            >
              {/* Image Container */}
              <img
                src={program.image || "/logo.jpg"}
                alt={program.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />

              {/* Sophisticated Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-secondary/90 via-secondary/20 to-transparent opacity-90 transition-opacity duration-500" />

              {/* Secondary Glow on Hover */}
              <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Content Overlay */}
              <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-10 space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <h5 className="text-lg md:text-md font-bold text-white leading-tight font-poppins uppercase tracking-wide">
                    {program.title}
                  </h5>

                  <Link href="/programs">
                    <button className="shrink-0 whitespace-nowrap border-2 border-white/50 bg-white/10 backdrop-blur-md text-white px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest hover:bg-white hover:text-secondary hover:border-white transition-all duration-300 active:scale-90">
                      Learn More
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeProgramSection;
