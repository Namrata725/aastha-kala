import ClientInstructors from "@/components/client/ClientInstructors";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const fetchInstructors = async () => {
  try {
    const res = await fetch(`${API_URL}/instructors`, {
      cache: "no-store",
    });

    if (!res.ok) throw new Error("Failed to fetch instructors");

    const data = await res.json();

    return data?.data?.data || [];
  } catch (error) {
    console.error(error);
    return [];
  }
};

const HomeInstructor = async () => {
  const instructors = await fetchInstructors();

  if (instructors.length === 0) return null;

  const limitedInstructors = instructors.slice(0, 4);
  const hasMoreThanFour = instructors.length > 4;

  return (
    <section className="bg-[#fcfcfd] py-20 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-16 md:mb-24 relative">
          <div className="absolute left-1/2 -top-12 -translate-x-1/2 w-64 h-64 bg-primary/5 rounded-full blur-[100px]" />
          
          <span className="text-primary font-black uppercase tracking-[0.4em] text-[10px] block mb-2">Expert Mentors</span>
          <h2 className="text-4xl md:text-6xl font-black text-[#001f54] tracking-tight font-poppins relative z-10 leading-tight">
            Meet Our <span className="text-primary">Instructors</span>
          </h2>
          <p className="text-gray-500 text-base md:text-lg max-w-2xl mx-auto font-medium relative z-10 leading-relaxed italic">
            "Learn from industry professionals and award-winning artists dedicated to your success."
          </p>
        </div>

        <ClientInstructors instructors={limitedInstructors} />

        {hasMoreThanFour && (
          <div className="text-center mt-16">
            <Link
              href="/instructors"
              className="inline-flex items-center gap-3 px-10 py-4 bg-[#001f54] text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-primary transition-all duration-300 shadow-xl hover:-translate-y-1 active:scale-95"
            >
              See All Instructors
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default HomeInstructor;
