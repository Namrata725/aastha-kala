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
    const testimonials = json?.data?.data || json?.data || [];
    if (Array.isArray(testimonials)) {
      return testimonials.sort(
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
    <section className="bg-gray-100 py-20 px-6 font-poppins">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h4 className="text-secondary font-bold mb-2 uppercase tracking-widest">Student Success Stories</h4>
          <h2 className="text-4xl md:text-5xl font-black text-primary font-poppins">
            What Our Students Say
          </h2>
        </div>
        <ClientTestimonialSlider data={data} />
      </div>
    </section>
  );
};

export default TestimonialSlider;
