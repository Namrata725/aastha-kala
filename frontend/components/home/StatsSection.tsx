"use client";

import React from "react";

interface StatsSectionProps {
  settings?: any;
}

const StatsSection: React.FC<StatsSectionProps> = ({ settings }) => {
  const stats = [
    {
      label: "Years Experience",
      value: settings?.years_of_experience || "25+",
    },
    {
      label: "Awards & Recognization",
      value: settings?.awards || "50+",
    },
    {
      label: "Expert Instructors",
      value: settings?.number_of_instructors || "10+",
    },
    {
      label: "Students Trained",
      value: settings?.number_of_students || "1000+",
    },
    {
      label: "Success Rate",
      value: settings?.success_rate || "95%",
    },
  ];
  return (
    <section className="relative w-full h-0 z-20">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-6xl px-4 sm:px-6 md:px-8">
        <div
          className="w-full py-6 md:py-8 px-6 md:px-10 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #3a1fa8 0%, #6b35c8 100%)",
            borderRadius: "10px",
            boxShadow:
              "0 20px 50px -12px rgba(58, 31, 168, 0.5), 0 10px 20px -5px rgba(107, 53, 200, 0.3)",
          }}
        >
          {/* Subtle accent light inside */}
          <div className="absolute top-0 left-0 w-full h-full bg-linear-to-b from-primary to-secondary  pointer-events-none" />

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-y-6 gap-x-4 items-center justify-items-center relative z-10">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center text-white gap-1 md:gap-2"
              >
                {/* Large bold value */}
                <span
                  className="font-extrabold leading-none"
                  style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)" }}
                >
                  {stat.value}
                </span>
                {/* Label underneath */}
                <p
                  className="font-medium leading-tight"
                  style={{
                    fontSize: "clamp(0.6rem, 1vw, 0.75rem)",
                    letterSpacing: "0.02em",
                    opacity: 0.85,
                    maxWidth: "100px",
                  }}
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
