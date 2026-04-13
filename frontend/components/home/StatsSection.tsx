import React from "react";

interface StatsSectionProps {
  settings?: any;
}

const StatsSection: React.FC<StatsSectionProps> = ({ settings }) => {
  if (!settings) return null;

  const stats = [
    { label: "Years Experience", value: settings?.years_of_experience + "+  " },
    { label: "Awards & Recognization", value: settings?.awards + "+" },
    {
      label: "Expert Instructors",
      value: settings?.number_of_instructors + "+",
    },
    { label: "Students Trained", value: settings?.number_of_students + "+" },
    { label: "Success Rate", value: settings?.success_rate + "%" },
  ].filter((stat) => stat.value); // Only show stats with values

  if (stats.length === 0) return null;
  return (
    <section className="relative w-full h-0 z-20">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 md:-translate-y-1/2 -translate-y-9/10 w-full max-w-6xl px-2 sm:px-6 md:px-8">
        <div className="absolute top-0 left-0 w-full h-full bg-linear-to-b from-primary to-secondary -z-10 pointer-events-none" />
        <div
          className="w-full py-6 md:py-8 px-2 sm:px-6 md:px-10 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
            borderRadius: "10px",
            boxShadow:
              "0 20px 50px -12px rgba(var(--primary-rgb), 0.5), 0 10px 20px -5px rgba(var(--secondary-rgb), 0.3)",
          }}
        >
          {/* Subtle accent light inside */}
          <div className="absolute top-0 left-0 w-full h-full bg-linear-to-b from-primary to-secondary  pointer-events-none" />

          <div className="flex flex-row items-start justify-between relative z-10 gap-1 md:gap-4">
            {stats.map((stat, index) => (
              <div key={index} className="flex-1 flex flex-col items-center text-center gap-1 md:gap-2">
                <span
                  className="font-extrabold leading-none text-white"
                  style={{ fontSize: "clamp(1.25rem, 3.5vw, 2.5rem)" }}
                >
                  {stat.value}
                </span>
                <p
                  className="font-medium leading-tight text-white "
                  style={{
                    fontSize: "clamp(0.55rem, 1vw, 0.75rem)",
                    letterSpacing: "0.02em",
                    maxWidth: "100px",
                    color: "#fff",
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
