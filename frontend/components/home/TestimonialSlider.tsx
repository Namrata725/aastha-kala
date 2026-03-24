import React from "react";
import ClientTestimonialSlider from "@/components/client/ClientTestimonialSlider";

interface Testimonial {
  id: number;
  name: string;
  title: string | null;
  description: string;
  rating: number;
  order: number;
  image: string | null;
  created_at: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const fetchTestimonials = async (): Promise<Testimonial[]> => {
  try {
    const res = await fetch(`${API_URL}/testimonials`, {
      cache: "no-store",
    });
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      return json.data.sort(
        (a: Testimonial, b: Testimonial) => a.order - b.order
      );
    }
  } catch (error) {
    console.error("Failed to fetch testimonials", error);
  }
  return [];
};

const TestimonialSlider = async () => {
  const data = await fetchTestimonials();

  if (data.length === 0) return null;

  return (
    <section className="bg-gray-100 py-10 px-10">
      {/* Heading */}
      <div className="text-center mb-12">
        <p className="text-secondary font-medium mb-2">Student Success Stories</p>
        <h2 className="text-3xl md:text-4xl font-bold text-primary">
          What Our Students Say
        </h2>
      </div>

      <div className="max-w-6xl mx-auto">
        <ClientTestimonialSlider data={data} />
      </div>
    </section>
  );
};

export default TestimonialSlider;
