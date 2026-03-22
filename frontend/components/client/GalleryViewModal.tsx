"use client";

import { useEffect } from "react";
import { ImageOff, ChevronLeft, ChevronRight, X } from "lucide-react";

type GalleryItem = {
  id: number;
  title: string;
  description?: string;
  type: "images" | "video";
  images?: string[];
  video?: string;
};

type Props = {
  item: GalleryItem | null;
  currentSlide: number;
  setCurrentSlide: React.Dispatch<React.SetStateAction<number>>;
  onClose: () => void;
  getYouTubeEmbedUrl: (url: string) => string;
};

const GalleryViewModal = ({
  item,
  currentSlide,
  setCurrentSlide,
  onClose,
  getYouTubeEmbedUrl,
}: Props) => {
  const getTotalSlides = () => {
    if (item?.type === "images" && item.images) {
      return 1 + item.images.length;
    }
    if (item?.type === "video") {
      return 2;
    }
    return 1;
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!item) return;

      const max = getTotalSlides() - 1;

      if (e.key === "ArrowRight") {
        setCurrentSlide((prev) => Math.min(prev + 1, max));
      }

      if (e.key === "ArrowLeft") {
        setCurrentSlide((prev) => Math.max(prev - 1, 0));
      }

      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [item]);

  if (!item) return null;

  const maxSlide = getTotalSlides() - 1;

  return (
    <div className="fixed inset-0 z-50 bg-black/10 flex items-center justify-center">
      <div className="bg-primary/10 border border-primary/20 backdrop-blur-xl w-full max-w-3xl rounded-xl p-2 relative overflow-y-auto max-h-[90vh] min-h-120">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 bg-black/60 text-white p-2 rounded-full"
        >
          <X size={18} />
        </button>

        {/* Prev Button */}
        {currentSlide > 0 && (
          <button
            onClick={() => setCurrentSlide((prev) => Math.max(prev - 1, 0))}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-black/60 text-white p-2 rounded-full"
          >
            <ChevronLeft />
          </button>
        )}

        {/* Next Button */}
        {currentSlide < maxSlide && (
          <button
            onClick={() =>
              setCurrentSlide((prev) => Math.min(prev + 1, maxSlide))
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-black/60 text-white p-2 rounded-full"
          >
            <ChevronRight />
          </button>
        )}

        {/* Content */}
        <div className="p-6">
          {currentSlide === 0 && (
            <div className="space-y-4">
              {/* Title with gradient */}
              <span className="text-3xl md:text-4xl font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                {item.title}
              </span>

              {/* Description (normal text for readability) */}
              <p className="text-base md:text-lg text-primary gray-700 leading-relaxed max-w-prose mt-3">
                {item.description || "No description available."}
              </p>
            </div>
          )}

          {/* Media Slides */}
          {currentSlide > 0 && (
            <div className="flex items-center justify-center">
              {(() => {
                const index = currentSlide - 1;

                // Images
                if (
                  item.type === "images" &&
                  item.images &&
                  item.images[index]
                ) {
                  return (
                    <img
                      src={item.images[index]}
                      className="max-h-[70vh] object-contain"
                      alt=""
                    />
                  );
                }

                // Video
                if (item.type === "video" && item.video && index === 0) {
                  return (
                    <iframe
                      src={getYouTubeEmbedUrl(item.video)}
                      className="w-full h-[60vh]"
                      allowFullScreen
                    />
                  );
                }

                return (
                  <div className="text-gray-500 flex flex-col items-center">
                    <ImageOff className="w-10 h-10 animate-infinite-bounce" />
                    <p className="mt-2 text-sm">No media available</p>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GalleryViewModal;
