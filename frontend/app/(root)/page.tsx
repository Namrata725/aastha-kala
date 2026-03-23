import HomeGallery from "@/components/home/HomeGallery";
import HomeInstructor from "@/components/home/HomeInstructor";
import TestimonialSlider from "@/components/home/TestimonialSlider";
import React from "react";

const page = () => {
  return (
    <div>
      <HomeInstructor />
      <TestimonialSlider />
      <HomeGallery />
    </div>
  );
};

export default page;
