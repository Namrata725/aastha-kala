"use client";

import React from "react";
import { X } from "lucide-react";
import { getYouTubeEmbedUrl } from "@/utils/url";

interface GalleryViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
}

const GalleryViewModal: React.FC<GalleryViewModalProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  const IMAGE_BASE = process.env.NEXT_PUBLIC_IMAGE_URL;

  const getImageUrl = (path?: string | null) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `${IMAGE_BASE?.replace(/\/$/, "")}/${path.replace(/^\/+/, "")}`;
  };

  if (!isOpen || !data) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-primary/5 backdrop-blur-lg border border-white/10 flex items-center justify-center z-50 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-primary/10 border border-primary/20 backdrop-blur-md w-full max-w-2xl rounded-xl p-6 relative overflow-y-auto max-h-[90vh] cursor-default"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-primary"
        >
          <X />
        </button>

        <h2 className="text-xl font-bold mb-6 text-primary">Gallery Details</h2>

        <div className="space-y-5 text-primary">
          {/* Title */}
          <div>
            <p className="text-sm text-primary font-bold">Title</p>
            <p className="font-medium text-white">{data.title}</p>
          </div>

          {/* Type */}
          <div>
            <p className="text-sm text-primary font-bold">Type</p>
            <p className="font-medium capitalize text-white">{data.type}</p>
          </div>

          {/* Category */}
          <div>
            <p className="text-sm text-primary font-bold">Category</p>
            <p className="font-medium text-white">
              {data.category?.name || "-"}
            </p>
          </div>

          {/* Position */}
          <div>
            <p className="text-sm text-primary font-bold">CategoryPosition</p>
            <p className="font-medium text-white">{data.position || "-"}</p>
          </div>

          {/* Video */}
          {data.type === "video" && data.video && (
            <div>
              <p className="text-sm text-primary font-bold mb-2">Video</p>
              <a
                href={data.video}
                target="_blank"
                className="text-blue-400 underline break-all block mb-3 text-xs"
              >
                {data.video}
              </a>
              <div className="w-full aspect-video rounded-lg overflow-hidden border border-primary/20 bg-black/20">
                <iframe
                  src={getYouTubeEmbedUrl(data.video)}
                  className="w-full h-full"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {/* Images */}
          {data.type === "images" && data.images?.length > 0 && (
            <div>
              <p className="text-sm text-primary font-bold mb-2">Images</p>

              <div className="grid grid-cols-3 gap-3">
                {data.images.map((img: string, index: number) => (
                  <img
                    key={index}
                    src={getImageUrl(img)}
                    className="w-full h-24 object-cover rounded-lg border border-primary/10"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GalleryViewModal;
