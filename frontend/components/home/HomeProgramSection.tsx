import ClientProgramSlider from "@/components/client/ClientProgramSlider";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const fetchPrograms = async () => {
  try {
    const res = await fetch(`${API_URL}/programs`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch programs");
    const data = await res.json();
    return data?.data?.data || data?.data || [];
  } catch (error) {
    console.error("Failed to fetch programs for home section:", error);
    return [];
  }
};

const HomeProgramSection = async () => {
  const programs = await fetchPrograms();

  if (programs.length === 0) return null;



  return (
    <section className="bg-gray-100 py-14 px-6">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-4">
          <div className="text-center md:text-left space-y-2">
            <h2 className="text-3xl md:text-4xl font-poppins tracking-tighter text-blue-900 font-black uppercase">
              What WE Offer
            </h2>
            <div className="h-1 w-20 bg-secondary mx-auto md:mx-0 rounded-full" />
          </div>

          <Link
            href="/programs"
            className="flex items-center gap-2 px-6 py-2 border-2 border-primary text-primary font-bold rounded-full hover:bg-primary hover:text-white transition-all duration-300 group"
          >
            All Programs
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* MOBILE VIEW: Show ALL Programs */}
        <div className="block md:hidden">
          <ClientProgramSlider programs={programs} viewType="grid" />
        </div>

        {/* DESKTOP/UI VIEW: The "Perfect" Slider */}
        <div className="hidden md:block">
          <ClientProgramSlider programs={programs} viewType="slider" />
        </div>

      </div>
    </section>
  );
};

export default HomeProgramSection;