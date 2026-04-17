"use client";

import React, { useState, useEffect } from "react";
import { Image as ImageIcon, ChevronLeft, ChevronRight, X } from "lucide-react";

type DressHireItem = {
  id: number;
  title: string;
  images: string[];
};

type ClientDressHireProps = {
  dresses: DressHireItem[];
};

const ClientDressHire: React.FC<ClientDressHireProps> = ({ dresses }) => {
  const IMAGE_URL = process.env.NEXT_PUBLIC_IMAGE_URL?.replace(/\/$/, "");

  const [modalOpen, setModalOpen] = useState(false);
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openModal = (images: string[], index = 0) => {
    setCurrentImages(images.length ? images : []);
    setCurrentIndex(index);
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const prevImage = () =>
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  const nextImage = () =>
    setCurrentIndex((prev) =>
      Math.min(prev + 1, currentImages.length - 1)
    );

  useEffect(() => {
    if (!modalOpen) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prevImage();
      else if (e.key === "ArrowRight") nextImage();
      else if (e.key === "Escape") closeModal();
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [modalOpen, currentImages]);

  const getFullImageUrl = (path: string) => {
    if (!path) return "";
    
    if (path.startsWith("http")) {
      // Defensive check: If production returns localhost URL due to misconfigured APP_URL, fix it
      if (typeof window !== "undefined" && !window.location.host.includes("localhost") && path.includes("localhost")) {
        const relativePath = path.split("/storage/")[1] || "";
        return `${IMAGE_URL}/${relativePath}`;
      }
      return path;
    }

    return `${IMAGE_URL}/${path.replace(/^\/+/, "")}`;
  };

  const getImageUrl = (images?: string[]) => {
    if (!images || images.length === 0) return null;
    return getFullImageUrl(images[0]);
  };

  return (
    <section className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
        {dresses.map((dress) => {
          const imageUrl = getImageUrl(dress.images);
          return (
            <div
              key={dress.id}
              className="border border-primary overflow-hidden shadow hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
              onClick={() => openModal(dress.images)}
            >
              <div className="h-70 w-full bg-gray-100 flex items-center justify-center overflow-hidden relative">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={dress.title}
                    className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <ImageIcon className="w-12 h-12 text-gray-400" />
                )}
              </div>
              <div className="p-1 text-center bg-primary text-white">
                <h3 className="text-lg font-semibold">{dress.title}</h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* modal */}
      {modalOpen && (
        <div className="fixed top-[68px] inset-x-0 bottom-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 transition-all duration-300">
          <div className="w-full h-full flex items-center justify-center">
             {/* Close Button */}
            <button
              className="absolute top-3 right-3 z-20 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition-all"
              onClick={closeModal}
            >
              <X size={18} />
            </button>

            {currentImages.length > 0 ? (
              <div className="relative w-full h-full flex items-center justify-center p-6">
                {/* Prev Button */}
                {currentIndex > 0 && (
                  <button
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition-all"
                    onClick={prevImage}
                  >
                    <ChevronLeft size={24} />
                  </button>
                )}

                <img
                  src={getFullImageUrl(currentImages[currentIndex])}
                  alt={`Image ${currentIndex + 1}`}
                  className="max-h-[80vh] object-contain shadow-2xl rounded-sm"
                />

                {/* Next Button */}
                {currentIndex < currentImages.length - 1 && (
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition-all"
                    onClick={nextImage}
                  >
                    <ChevronRight size={24} />
                  </button>
                )}

                {/* Optional: Subtle Indicator if you want it (Gallery doesn't, but helpful) */}
                {currentImages.length > 1 && (
                   <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/40 text-[9px] font-black tracking-[0.3em] uppercase transition-opacity">
                      {currentIndex + 1} / {currentImages.length}
                   </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-white/50">
                <ImageIcon className="w-16 h-16 mb-4 opacity-10" />
                <p className="text-xs uppercase tracking-widest font-bold">No images available</p>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default ClientDressHire;
