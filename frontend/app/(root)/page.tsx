import HeroSection from "@/components/home/HeroSection";
import StatsSection from "@/components/home/StatsSection";
import AboutHomeSection from "@/components/home/AboutHomeSection";
import InstructorSection from "@/components/home/InstructorSection";
import GalleryHomeSection from "@/components/home/GalleryHomeSection";
import TestimonialSlider from "@/components/home/TestimonialSlider";
import ContactHomeSection from "@/components/home/ContactHomeSection";
import React from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const fetchSettings = async () => {
  try {
    const res = await fetch(`${API_URL}/settings`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch settings");
    const data = await res.json();
    return data?.data || { setting: null, social_links: null };
  } catch (error) {
    console.error(error);
    return { setting: null, social_links: null };
  }
};

const fetchGalleriesByPosition = async (position: string) => {
  try {
    const res = await fetch(`${API_URL}/galleries/position/${position}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to fetch galleries");
    return await res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
};

const Page = async () => {
  const data = await fetchSettings();
  const settings = data?.setting;
  const socialLinks = data?.social_links;
  const aboutHomeGallery = await fetchGalleriesByPosition("about-home");

  return (
    <div className="bg-white">
      <HeroSection />
      <StatsSection settings={settings} />
      <AboutHomeSection settings={settings} gallery={aboutHomeGallery?.[0]} />
      <InstructorSection />
      <TestimonialSlider />
      <GalleryHomeSection socialLinks={socialLinks} />
      <ContactHomeSection settings={settings} />
    </div>
  );
};

export default Page;

