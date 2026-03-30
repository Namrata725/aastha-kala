"use client";

import { useState } from "react";
import GalleryViewModal from "./GalleryViewModal";
import { ImageOff } from "lucide-react";
import { getYouTubeEmbedUrl } from "@/utils/url";

type Category = {
  id: number;
  name: string;
};

type GalleryItem = {
  id: number;
  title: string;
  description?: string;
  type: "images" | "video";
  category_id: number;
  category?: {
    name: string;
  };
  images?: string[];
  video?: string;
};

type Props = {
  gallery: GalleryItem[];
  categories: Category[];
};

const ClientGallery = ({ gallery, categories }: Props) => {
  const [activeCategory, setActiveCategory] = useState<number | "all">("all");
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const filteredGallery =
    activeCategory === "all"
      ? gallery
      : gallery.filter((item) => item.category_id === activeCategory);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Tabs */}
      <div className="flex flex-wrap gap-6 pb-3">
        <button
          onClick={() => setActiveCategory("all")}
          className={`pb-2 ${
            activeCategory === "all"
              ? "border-b-2 border-primary text-primary font-medium"
              : "text-gray-600"
          }`}
        >
          All
        </button>

        {(Array.isArray(categories) ? categories : []).map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`pb-2 ${
              activeCategory === cat.id
                ? "border-b-2 border-primary text-primary font-medium"
                : "text-gray-600"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredGallery.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-500">
            <ImageOff className="w-12 h-12 animate-infinite-bounce" />
            <p className="mt-3 text-sm">No images or videos in this category</p>
          </div>
        ) : (
          filteredGallery.map((item) => {
            const categoryName =
              item.category?.name ||
              (Array.isArray(categories) ? categories : []).find(
                (c) => c.id === item.category_id,
              )?.name;

            return (
              <div
                key={item.id}
                onClick={() => {
                  setSelectedItem(item);
                  setCurrentSlide(0);
                }}
                className="relative rounded-xl overflow-hidden shadow-md group cursor-pointer"
              >
                {/* Badge */}
                {categoryName && (
                  <span className="absolute top-2 left-2 z-10 p-1px rounded-full bg-linear-to-r from-blue-500 to-purple-500">
                    <span className="block bg-white text-sm px-3 py-1 rounded-full">
                      {categoryName}
                    </span>
                  </span>
                )}

                {/* Image */}
                {item.type === "images" && (
                  <>
                    {item.images && item.images.length > 0 ? (
                      <img
                        src={item.images[0]}
                        className="w-full h-64 object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="w-full h-64 flex flex-col items-center justify-center bg-gray-100 text-gray-500">
                        <ImageOff className="w-10 h-10 animate-infinite-bounce" />
                        <span className="mt-2 text-sm">No image found</span>
                      </div>
                    )}
                  </>
                )}

                {/* Video */}
                {item.type === "video" && item.video && (
                  <iframe
                    src={getYouTubeEmbedUrl(item.video)}
                    className="w-full h-64 pointer-events-none"
                    allowFullScreen
                  />
                )}

                {/* Hover Title */}
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition duration-300">
                  <p
                    className="text-primary text-center px-3 text-lg"
                    style={{ color: "white !important" }}
                  >
                    {item.title}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      <GalleryViewModal
        item={selectedItem}
        currentSlide={currentSlide}
        setCurrentSlide={setCurrentSlide}
        onClose={() => setSelectedItem(null)}
        getYouTubeEmbedUrl={getYouTubeEmbedUrl}
      />
    </div>
  );
};

export default ClientGallery;
