import React from "react";
import HeadingSlider from "./HeadingSlider";
import { getYouTubeEmbedUrl } from "@/utils/url";

export type HeroMedia = {
  url: string;
  type: "image" | "video";
};

interface HeadingProps {
  title: string;
  subtitle: React.ReactNode;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const IMAGE_URL = process.env.NEXT_PUBLIC_IMAGE_URL;

const fetchHeroMedia = async (): Promise<HeroMedia[]> => {
  try {
    const res = await fetch(`${API_URL}/galleries/position/slider-home`, {
      next: { revalidate: 3600 },
    });
    
    if (!res.ok) return [];
    
    const json = await res.json();
    const items = Array.isArray(json) ? json : (json?.data || []);
    
    const media: HeroMedia[] = [];

    items.forEach((item: any) => {
      if (item.type === "images" && item.images) {
        item.images.forEach((img: string) => {
          let cleanPath = img;
          if (img.startsWith("http")) {
            try {
              const parsed = new URL(img);
              cleanPath = parsed.pathname;
            } catch {}
          }
          const base = IMAGE_URL || "http://localhost:8000/storage/";
          const finalBase = base.endsWith("/") ? base.slice(0, -1) : base;
          const normalizedPath = cleanPath.replace("/storage", "");
          const imgPath = normalizedPath.startsWith("/") ? normalizedPath : `/${normalizedPath}`;
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
    console.error("Failed to fetch heading slider media", err);
    return [];
  }
};

const Heading = async ({ title, subtitle }: HeadingProps) => {
  const media = await fetchHeroMedia();

  return (
    <HeadingSlider 
      title={title} 
      subtitle={subtitle} 
      media={media} 
    />
  );
};

export default Heading;
