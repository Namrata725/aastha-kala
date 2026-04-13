export const dynamic = "force-dynamic";
import React from "react";
import Heading from "@/components/global/Heading";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

const fetchSettings = async () => {
  try {
    const res = await fetch(`${API_URL}/settings`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch settings");
    const data = await res.json();
    return data?.data || { setting: null, why_us: [] };
  } catch (error) {
    console.error(error);
    return { setting: null, why_us: [] };
  }
};

const fetchGalleryByPosition = async (position: string) => {
  try {
    const res = await fetch(`${API_URL}/galleries/position/${position}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to fetch gallery");
    const data = await res.json();
    return data || [];
  } catch (error) {
    console.error(error);
    return [];
  }
};

const defaultWhyUs = [
  {
    title: "Expert Guidance",
    desc: "Our skilled teachers provide perso l guidance, helping students grow with strong fundamentals and artistic confidence.",
  },
  {
    title: "Balanced & Holistic Learning",
    desc: "We focus on technique, expression, discipline, and creativity—honoring tradition while embracing modern styles.",
  },
  {
    title: "Classes for All Ages & Levels",
    desc: "From beginners to advanced learners, our programs are designed for children, youth, and adults alike.",
  },
  {
    title: "Regular Performances & Exposure",
    desc: "Students get opportunities to perform on stage, participate in events, and attend workshops to build real-world experience.",
  },
  {
    title: "Warm & Supportive Environment",
    desc: "A positive, inspiring space where every student feels encouraged to learn, express, and shine.",
  },
];

function WhyCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow border border-gray-100 flex flex-col group hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      <div className="bg-blue-600 group-hover:bg-blue-700 transition-colors py-3 px-4">
        <h2 className="text-white font-semibold text-sm text-center leading-snug font-poppins">
          {title}
        </h2>
      </div>
      <div className="p-6 flex-1 flex items-center justify-center text-center">
        <p className="text-black text-lg leading-relaxed font-poppins text-justify">{desc}</p>
      </div>
    </div>
  );
}

const AboutPage = async () => {
  const [data, aboutGallery] = await Promise.all([
    fetchSettings(),
    fetchGalleryByPosition("about-intro"),
  ]);

  const settings = data?.setting;
  const whyUs: any[] = data?.why_us || [];

  const introImages = aboutGallery.length > 0 ? aboutGallery[0].images : [];
  const image1 = introImages[0] || "/images/program-fallback.png";
  const image2 = introImages[1] || image1;

  const cards =
    whyUs.length > 0
      ? whyUs.map((item: any) => ({ title: item.title, desc: item.description }))
      : defaultWhyUs;

  return (
    <div className="bg-white font-poppins">
      <Heading
        title="About Us"
        subtitle="Discover our story, mission, and the passion behind Aastha Kala Kendra."
      />

      {/* ── ABOUT INTRO ── */}
      <section className="max-w-6xl mx-auto px-6 pt-12 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

          {/* Left: text */}
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-blue-700 leading-tight mb-1 font-poppins">
              {settings?.company_name || "Aasha Kala Kendra"}
            </h1>
            <h2 className="text-xl text-purple-600 font-medium mb-6 font-poppins">
              Dance & Music School
            </h2>
            <div className="space-y-4 text-black text-lg leading-7 text-justify font-poppins">
              <p>
                {settings?.about ||
                  "Aastha Kala Kendra is a premier institution dedicated to the preservation and promotion of traditional dance and music forms. Since its inception, we have been a cradle for artistic excellence, nurturing talent and fostering a deep appreciation for the arts."}
              </p>
            </div>
          </div>

          {/* Right: overlapping images */}
          <div className="relative h-[340px] md:h-[380px] mt-6 lg:mt-0">
            {/* Main image — top right */}
            <div className="absolute top-0 right-0 w-[85%] h-[88%] rounded-2xl overflow-hidden z-0">
              <img
                src={image1}
                alt="Dance School Students"
                className="w-full h-full object-contain"
              />
            </div>
            {/* Overlapping image — bottom left */}
            <div className="absolute bottom-0 left-0 w-[58%] h-[58%] rounded-2xl overflow-hidden z-10">
              <img
                src={image2}
                alt="Dance Performance"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

        </div>
      </section>

      {/* ── WHY CHOOSE ── */}
      <section className="bg-blue-50/50 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-blue-700 text-center mb-12 font-poppins">
            {settings?.why_choose_heading ||
              `Why Choose ${settings?.company_name || "Aasha Kala Kendra"}?`}
          </h2>

          {/* Always 3 per row, wraps automatically as cards increase */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-black">
            {cards.map((item, idx) => (
              <WhyCard key={idx} title={item.title} desc={item.desc} />
            ))}
          </div>
        </div>
      </section>

      {/* ── MISSION ── */}
      <section className="bg-white py-16 px-6 border-t border-gray-100">
        <div className="w-full max-w-7xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-blue-700 mb-10 font-poppins">
            Our Mission
          </h2>
          <div className="relative px-8 space-y-4 text-justify">
            {settings?.mission &&
            Array.isArray(settings.mission) &&
            settings.mission.length > 0 ? (
              settings.mission.map((item: any, idx: number) => (
                <p
                  key={idx}
                  className="font-poppins text-lg text-black leading-8"
                >
                  {item.title}
                </p>
              ))
            ) : (
              <p className="font-poppins text-lg text-black leading-8">
                {settings?.mission_paragraph ||
                  "To empower students through dance and music, helping them grow not only as performers but as confident individuals who respect art, culture, and creativity."}
              </p>
            )}
          </div>
        </div>
      </section>

    </div>
  );
};

export default AboutPage;