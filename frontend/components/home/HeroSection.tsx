import HeroSlider from "@/components/client/HeroSlider";
import { getYouTubeEmbedUrl } from "@/utils/url";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const IMAGE_URL = process.env.NEXT_PUBLIC_IMAGE_URL;

export type HeroMedia = {
  url: string;
  type: "image" | "video";
};

const fetchHero = async (): Promise<HeroMedia[]> => {
  try {
    const res = await fetch(`${API_URL}/galleries/position/slider-home`, {
      cache: "no-store",
    });
    const data = await res.json();
    
    // Support multiple response formats: data.data.data (paginated), data.data (standard), or data (direct array)
    const rawData = data?.data?.data || data?.data || data || [];
    const items = Array.isArray(rawData) ? rawData : [];
    
    const media: HeroMedia[] = [];

    items.forEach((item: any) => {
      if (item.type === "images" && item.images) {
        item.images.forEach((img: string) => {
          if (!img) return;
          let cleanPath = img;
          
          // Extract relative path even if it's an absolute URL from DB
          if (img.startsWith("http")) {
            try {
              const urlObj = new URL(img);
              cleanPath = urlObj.pathname;
            } catch {}
          }

          const base = IMAGE_URL || "http://localhost:8000/storage/";
          const finalBase = base.endsWith("/") ? base.slice(0, -1) : base;
          
          // Ensure we don't double up /storage
          const relativePath = cleanPath.replace(/^\/storage/, "").replace(/^storage/, "");
          const imgPath = relativePath.startsWith("/") ? relativePath : `/${relativePath}`;
          
          media.push({
            url: `${finalBase}${imgPath}`,
            type: "image",
          });
        });
      } else if (item.type === "video" && item.video) {
        media.push({
          url: getYouTubeEmbedUrl(item.video),
          type: "video",
        });
      }
    });

    return media;
  } catch (err) {
    console.error("Failed to fetch hero media", err);
  }
  return [];
};

const HeroSection = async () => {
  const heroMedia = await fetchHero();

  if (heroMedia.length === 0) return null;

  return (
    <section className="relative w-full h-[450px] sm:h-[550px] md:h-[650px] lg:h-[750px] bg-brand-deep overflow-hidden">
      {/* ── Hero image/video – Fill entire section ── */}
      <div className="absolute inset-0 z-10">
        <HeroSlider heroMedia={heroMedia} fill />
      </div>

    </section>
  );
};

export default HeroSection;

