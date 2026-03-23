"use client";

import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { Star, MessageCircle } from "lucide-react";

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

const TestimonialSlider = () => {
  const [data, setData] = useState<Testimonial[]>([]);
  const [expanded, setExpanded] = useState<number[]>([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/testimonials`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          const sorted = res.data.sort(
            (a: Testimonial, b: Testimonial) => a.order - b.order,
          );
          setData(sorted);
        }
      });
  }, []);

  const toggleExpand = (id: number) => {
    setExpanded((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const truncateText = (text: string, limit: number) => {
    if (text.length <= limit) return text;
    return text.slice(0, limit) + "...";
  };

  return (
    <section className="bg-gray-100 py-16 px-4">
      {/* Heading */}
      <div className="text-center mb-12">
        <p className="text-secondary font-medium mb-2">
          Student Success Stories
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-primary">
          What Our Students Say
        </h2>
      </div>

      <div className="max-w-6xl mx-auto">
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <MessageCircle className="w-12 h-12 animate-bounce text-secondary" />

            <p className="text-lg font-medium mt-3">
              No testimonials available
            </p>
            <p className="text-sm mt-2">
              Be the first to share your experience!
            </p>
          </div>
        ) : (
          <Swiper
            modules={[Autoplay, Pagination]}
            spaceBetween={24}
            slidesPerView={3}
            loop={data.length > 1}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}
            pagination={{ clickable: true }}
            breakpoints={{
              0: { slidesPerView: 1 },
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            className="pb-12 testimonial-swiper"
          >
            {data.map((item) => (
              <SwiperSlide key={item.id}>
                <div className="bg-white min-h-60 rounded-2xl p-6 shadow-md border-b-4 border-secondary h-full flex flex-col justify-between hover:shadow-xl transition">
                  {/* User */}
                  <div className="flex gap-4 mb-4">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-white font-bold">
                        {item.name.charAt(0)}
                      </div>
                    )}

                    <div>
                      <h3 className="font-semibold text-secondary text-lg">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {item.title || "Vocal Student"}
                      </p>
                    </div>
                  </div>

                  {/* Stars */}
                  <div className="flex mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={
                          i < item.rating
                            ? "text-yellow-500 fill-yellow-500"
                            : "text-gray-300"
                        }
                      />
                    ))}
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {expanded.includes(item.id)
                      ? item.description
                      : truncateText(item.description, 70)}
                  </p>

                  {item.description.length > 70 && (
                    <div className="mt-1 text-left">
                      <button
                        onClick={() => toggleExpand(item.id)}
                        className="text-secondary text-sm font-medium hover:underline"
                      >
                        {expanded.includes(item.id) ? "See less" : "See more"}
                      </button>
                    </div>
                  )}

                  {/* Date */}
                  <p className="text-xs text-gray-400 mt-4">
                    {new Date(item.created_at).toDateString()}
                  </p>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>
    </section>
  );
};

export default TestimonialSlider;
