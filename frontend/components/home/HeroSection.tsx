import HeroSlider from "@/components/client/HeroSlider";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const IMAGE_URL = process.env.NEXT_PUBLIC_IMAGE_URL;

const fetchHero = async (): Promise<string[]> => {
  try {
    const res = await fetch(`${API_URL}/galleries/position/slider-home`, {
      cache: "no-store",
    });
    const data = await res.json();
    if (
      data &&
      data.length > 0 &&
      data[0].images &&
      data[0].images.length > 0
    ) {
      return data[0].images.map((img: string) => {
        let cleanPath = img;
        if (img.startsWith("http")) {
          try {1
            const parsed = new URL(img);
            cleanPath = parsed.pathname; // extracts e.g. "/storage/gallery/image.jpg"
          } catch {}
        }
        const base = IMAGE_URL || "http://localhost:8000/storage/";
        // If NEXT_PUBLIC_IMAGE_URL includes /storage and cleanPath includes /storage, deduplicate it
        const finalBase = base.endsWith("/") ? base.slice(0, -1) : base;
        const normalizedPath = cleanPath.replace("/storage", "");
        const imgPath = normalizedPath.startsWith("/") ? normalizedPath : `/${normalizedPath}`;
        return `${finalBase}${imgPath}`;
      });
    }
  } catch (err) {
    console.error("Failed to fetch hero images", err);
  }
  return [];
};

const HeroSection = async () => {
  const heroImages = await fetchHero();

  if (heroImages.length === 0) return null;

  return (
    <section className="relative w-full h-[450px] sm:h-[550px] md:h-[650px] lg:h-[750px] bg-brand-deep overflow-hidden">
      {/* ── Hero image – Fill entire section ── */}
      <div className="absolute inset-0 z-10">
        <HeroSlider heroImages={heroImages} fill />
      </div>
      {/* ── Gradient Overlay (Blend into white) ───────────────── */}
      <div className="absolute inset-x-0 bottom-0 h-32 md:h-48 bg-linear-to-b from-transparent to-white pointer-events-none z-20" />
    </section>
  );
};

export default HeroSection;
