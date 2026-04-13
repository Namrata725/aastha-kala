"use client";

import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import ProgramPopupModal from "../layout/ProgramPopupModal";
import BookingModal from "../layout/BookingModal";

interface Schedule {
  id: number;
  start_time: string;
  end_time: string;
  instructor?: { name: string };
}

interface Program {
  id: number;
  title: string;
  description?: string;
  image?: string;
  speciality?: string[];
  is_active: boolean;
  schedules?: Schedule[];
}

interface ClientProgramSliderProps {
  programs: Program[];
  viewType?: "slider" | "grid";
}

const ClientProgramSlider: React.FC<ClientProgramSliderProps> = ({ programs, viewType = "slider" }) => {
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [bookingProgram, setBookingProgram] = useState<Program | null>(null);

  const renderCard = (program: Program, index: number) => {
    const isOdd = index % 2 !== 0;
    return (
      <div
        key={program.id}
        onClick={() => setSelectedProgram(program)}
        className="group relative overflow-hidden h-[250px] md:h-[550px] transition-transform duration-500 hover:-translate-y-2 cursor-pointer shadow-lg rounded-xl"
      >
        {/* Background Image */}
        <img
          src={program.image || "/images/program-fallback.png"}
          alt={program.title}
          className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
        />

        {/* Enhanced Gradient Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-${isOdd ? "b" : "t"} from-black/80 via-black/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-300`} />

        {/* Content - Alternating Position */}
        <div className={`absolute ${isOdd ? "top-3 md:top-6" : "bottom-3 md:bottom-6"} left-3 md:left-6 right-3 md:right-6 flex flex-col gap-2 md:gap-4`}>
          {/* Program Title */}
          <h3 className="text-white text-xs md:text-xl font-black uppercase tracking-wider leading-tight drop-shadow-lg transform transition-transform duration-300 group-hover:translate-x-1">
            {program.title}
          </h3>

          <div className="flex items-center justify-center">
             {/* Join Button */}
             <button
                onClick={(e) => {
                  e.stopPropagation();
                  setBookingProgram(program);
                }}
                className="shrink-0 w-8 h-8 md:w-12 md:h-12 rounded-full bg-cyan-400 hover:bg-cyan-300 active:scale-95 transition-all duration-300 flex items-center justify-center shadow-xl hover:rotate-12"
                aria-label={`Join ${program.title}`}
              >
                <span className="text-white text-[7px] md:text-[10px] font-black uppercase tracking-wider text-center leading-none">
                  JOIN<br/>NOW
                </span>
              </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="program-slider-container relative">
      {viewType === "slider" ? (
        <Swiper
          modules={[Autoplay, Pagination, Navigation]}
          spaceBetween={20}
          slidesPerView={4}
          loop={programs.length > 4}
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
          }}
          pagination={{ 
            clickable: true,
            el: ".program-pagination",
          }}
          navigation={{
            nextEl: ".program-next",
            prevEl: ".program-prev",
          }}
          breakpoints={{
            0: { slidesPerView: 1 },
            640: { slidesPerView: 2 },
            768: { slidesPerView: 3 },
            1024: { slidesPerView: 4 },
          }}
          className="pb-16"
        >
          {programs.map((program, index) => (
            <SwiperSlide key={program.id}>
              {renderCard(program, index)}
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-1 gap-3 md:gap-6 pb-10">
          {programs.map((program, index) => renderCard(program, index))}
        </div>
      )}

      {/* Custom Navigation Buttons (Only for slider) */}
      {viewType === "slider" && (
        <>
          <button className="program-prev absolute top-1/2 -left-4 md:-left-12 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white shadow-xl border border-gray-100 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all duration-300 active:scale-95 disabled:opacity-0">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <button className="program-next absolute top-1/2 -right-4 md:-right-12 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white shadow-xl border border-gray-100 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all duration-300 active:scale-95 disabled:opacity-0">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
          <div className="program-pagination hidden" />
        </>
      )}

      {/* Modals */}
      {selectedProgram && (
        <ProgramPopupModal 
          program={selectedProgram}
          onClose={() => setSelectedProgram(null)}
          onBook={() => {
            setBookingProgram(selectedProgram);
            setSelectedProgram(null);
          }}
        />
      )}

      {bookingProgram && (
        <BookingModal 
          program={bookingProgram}
          onClose={() => setBookingProgram(null)}
        />
      )}
    </div>
  );
};

export default ClientProgramSlider;
