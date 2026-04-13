import React from "react";
import HeadingSlider from "./HeadingSlider";

interface HeadingProps {
  title: string;
  subtitle: React.ReactNode;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const fetchHeroImages = async () => {
  try {
    const res = await fetch(`${API_URL}/galleries/position/slider-home`, {
      next: { revalidate: 3600 },
    });
    
    if (!res.ok) return [];
    
    const json = await res.json();
    const data = Array.isArray(json) ? json : (json?.data || []);
    
    if (
      data &&
      data.length > 0 &&
      data[0].images &&
      data[0].images.length > 0
    ) {
      return data[0].images.map((img: string) => {
        if (img.startsWith("http")) return img;
        
        // Use environment variable with a hardcoded fallback for local development
        const base = process.env.NEXT_PUBLIC_IMAGE_URL || "http://localhost:8000/storage/";
        const baseUrl = base.endsWith("/") ? base.slice(0, -1) : base;
        const imgPath = img.startsWith("/") ? img : `/${img}`;
        
        return `${baseUrl}${imgPath}`;
      });
    }
    return [];
  } catch (err) {
    console.error("Failed to fetch heading slider images", err);
    return [];
  }
};

const Heading = async ({ title, subtitle }: HeadingProps) => {
  const images = await fetchHeroImages();

  return (
    <HeadingSlider 
      title={title} 
      subtitle={subtitle} 
      images={images} 
    />
  );
};

export default Heading;
