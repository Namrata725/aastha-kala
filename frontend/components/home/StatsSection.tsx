import React from "react";

interface StatsSectionProps {
  settings?: any;
}

const StatsSection: React.FC<StatsSectionProps> = ({ settings }) => {
  const stats = [
    { label: "Years Experience", value: (settings?.years_of_experience || "10") + "+" },
    { label: "Awards & Recognition", value: (settings?.awards || "15") + "+" },
    {
      label: "Expert Instructors",
      value: (settings?.number_of_instructors || "25") + "+",
    },
    { label: "Students Trained", value: (settings?.number_of_students || "500") + "+" },
    { label: "Success Rate", value: (settings?.success_rate || "99") + "%" },
  ];
  return (
    <section className="relative w-full z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="relative w-full -mt-16 md:-mt-24 py-10 md:py-16 px-6 md:px-12 rounded-[2rem] overflow-hidden shadow-[0_20px_60px_-15px_rgba(39,160,207,0.4)]"
          style={{
            background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
          }}
        >
          {/* Subtle background patterns/accents could go here */}
          <div className="absolute inset-0 bg-white/5 pointer-events-none" />

          <div className="flex flex-wrap items-center justify-around relative z-10 gap-8 md:gap-4">
            {stats.map((stat, index) => (
              <div key={index} className="flex flex-col items-center text-center gap-2 min-w-[120px]">
                <span
                  className="font-extrabold leading-none text-white drop-shadow-sm"
                  style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
                >
                  {stat.value}
                </span>
                <p
                  className="font-bold leading-tight text-white uppercase tracking-widest opacity-90"
                  style={{
                    fontSize: "clamp(0.7rem, 1.2vw, 0.85rem)",
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
