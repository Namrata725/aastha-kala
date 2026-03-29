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
  const IMAGE_BASE = process.env.NEXT_PUBLIC_API_URL;

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
    setCurrentIndex((prev) =>
      prev === 0 ? currentImages.length - 1 : prev - 1,
    );
  const nextImage = () =>
    setCurrentIndex((prev) =>
      prev === currentImages.length - 1 ? 0 : prev + 1,
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

  const getImageUrl = (images?: string[]) => {
    if (!images || images.length === 0) return null;
    const path = images[0];
    if (path.startsWith("http")) return path;
    return `${IMAGE_BASE?.replace(/\/$/, "")}/${path.replace(/^\/+/, "")}`;
  };

  const getFullImageUrl = (path: string) => {
    if (path.startsWith("http")) return path;
    return `${IMAGE_BASE?.replace(/\/$/, "")}/${path.replace(/^\/+/, "")}`;
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
        {dresses.map((dress) => {
          const imageUrl = getImageUrl(dress.images);
          return (
            <div
              key={dress.id}
              className="border border-primary  overflow-hidden shadow hover:shadow-lg transition-shadow duration-300 cursor-pointer"
              onClick={() => openModal(dress.images)}
            >
              <div className="h-70 w-full bg-gray-100 flex items-center justify-center overflow-hidden relative">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={dress.title}
                    className="w-full h-full object-cover"
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
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center">
          <button
            className="absolute top-4 right-4 text-white p-2"
            onClick={closeModal}
          >
            <X className="w-6 h-6" />
          </button>

          {currentImages.length > 0 ? (
            <div className="relative max-w-3xl max-h-[80vh] w-full flex items-center justify-center">
              <button
                className="absolute left-0 text-white p-2"
                onClick={prevImage}
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <img
                src={getFullImageUrl(currentImages[currentIndex])}
                alt={`Image ${currentIndex + 1}`}
                className="max-h-[80vh] object-contain"
              />
              <button
                className="absolute right-0 text-white p-2"
                onClick={nextImage}
              >
                <ChevronRight className="w-8 h-8" />
              </button>

              {/* Image counter */}
              <div className="absolute bottom-4 text-white text-sm bg-black/50 px-2 py-1 rounded">
                {currentIndex + 1} / {currentImages.length}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-white">
              <ImageIcon className="w-16 h-16 mb-2" />
              <p>No images available</p>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ClientDressHire;
