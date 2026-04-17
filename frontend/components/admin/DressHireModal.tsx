"use client";

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import InputField from "../layout/InputField";

interface Dress {
  id?: number;
  title: string;
  order: number;
  images?: string[];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  dress?: Dress | null;
  existingOrders?: number[];
}

const DressHireModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSuccess,
  dress,
  existingOrders = [],
}) => {
  const isEdit = !!dress;

  const [title, setTitle] = useState("");
  const [order, setOrder] = useState(0);

  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [removedImages, setRemovedImages] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (dress) {
      setTitle(dress.title);
      setOrder(dress.order);
      setExistingImages(dress.images || []);
    } else {
      setTitle("");
      setOrder(0);
      setExistingImages([]);
    }

    setImages([]);
    setRemovedImages([]);
  }, [dress, isOpen]);

  useEffect(() => {
    return () => {
      images.forEach((file) => URL.revokeObjectURL(file as any));
    };
  }, [images]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    // Check for duplicate order
    const isDuplicate = existingOrders.some((o) => {
      if (isEdit && o === dress?.order) return false;
      return o === order;
    });

    if (isDuplicate) {
      toast.error(`The order number ${order} is already assigned to another dress.`);
      return;
    }

    try {
      setLoading(true);

      const url = isEdit
        ? `${process.env.NEXT_PUBLIC_API_URL}/admin/dress-hire/${dress?.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/admin/dress-hire`;

      const formData = new FormData();
      formData.append("title", title);
      formData.append("order", order.toString());

      images.forEach((img) => formData.append("images[]", img));
      removedImages.forEach((img, i) =>
        formData.append(`removed_images[${i}]`, img),
      );
      if (isEdit) formData.append("_method", "PUT");

      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      const result = await res.json();

      if (!res.ok) throw result;

      toast.success(isEdit ? "Updated" : "Created");
      onSuccess?.();
      onClose();
    } catch (err: any) {
      if (err?.errors) {
        const messages = Object.values(err.errors).flat().join("\n");
        toast.error(messages);
      } else {
        toast.error(err.message || "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 flex items-center justify-center bg-black/20"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white p-6 rounded-xl w-[600px]"
      >
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-bold">
            {isEdit ? "Edit Dress" : "Add Dress"}
          </h2>

          <button onClick={onClose}>
            <X />
          </button>
        </div>

        <div className="space-y-4">
          <InputField
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <InputField
            label="Order"
            type="number"
            value={order}
            onChange={(e) => setOrder(Number(e.target.value))}
          />

          {/* existing Images */}
          <div className="flex gap-2 flex-wrap">
            {existingImages.map((img, i) => (
              <div key={i} className="relative">
                <img src={img} className="w-20 h-20 object-cover rounded" />

                <button
                  onClick={() => {
                    setRemovedImages((prev) => [...prev, img]);
                    setExistingImages((prev) =>
                      prev.filter((_, idx) => idx !== i),
                    );
                  }}
                  className="absolute top-0 right-0 bg-red-500 text-white text-xs px-1"
                >
                  X
                </button>
              </div>
            ))}
          </div>

          {/* upload */}
          <div className="flex items-center border border-gray-300 rounded overflow-hidden w-fit text-sm">
            <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-3 py-1.5 text-gray-700 whitespace-nowrap">
              Choose File
              <input
                type="file"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) {
                    const files = Array.from(e.target.files);
                    setImages((prev) => [...prev, ...files]);
                  }
                }}
              />
            </label>
            <span className="px-1 text-gray-400">|</span>
            <span className="px-3 py-1.5 text-gray-400 truncate max-w-[200px]">
              {images.length > 0
                ? images.length === 1
                  ? images[0].name
                  : `${images.length} files selected`
                : "No file chosen"}
            </span>
          </div>

          <div className="flex gap-2 flex-wrap">
            {images.map((file, i) => {
              const preview = URL.createObjectURL(file);

              return (
                <div key={i} className="relative">
                  <img
                    src={preview}
                    className="w-20 h-20 object-cover rounded"
                  />

                  <button
                    onClick={() => {
                      setImages((prev) => prev.filter((_, idx) => idx !== i));
                    }}
                    className="absolute top-0 right-0 bg-red-500 text-white text-xs px-1"
                  >
                    X
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="bg-primary text-white px-4 py-2 rounded"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DressHireModal;