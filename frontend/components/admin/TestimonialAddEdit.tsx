"use client";

import React, { useEffect, useState } from "react";
import {
  X,
  Plus,
  Pencil,
  User,
  Star,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import InputField from "../layout/InputField";

interface Testimonial {
  id?: number;
  name: string;
  description: string;
  rating: number;
  order: number;
  image?: string | null;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialData?: Testimonial | null;
}

const TestimonialAddEdit: React.FC<Props> = ({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}) => {
  const isEdit = !!initialData;
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const IMAGE_BASE = process.env.NEXT_PUBLIC_IMAGE_URL;

  const [form, setForm] = useState<Testimonial>({
    name: "",
    description: "",
    rating: 0,
    order: 0,
  });

  const [errors, setErrors] = useState<any>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [loading, setLoading] = useState(false);

  const getImageUrl = (path?: string | null) => {
    if (!path) return null;

    if (path.startsWith("http")) return path;

    return `${IMAGE_BASE?.replace(/\/$/, "")}/${path.replace(/^\/+/, "")}`;
  };

  useEffect(() => {
    if (!isOpen) return;

    setErrors({});
    setRemoveImage(false);

    if (initialData) {
      setForm({
        name: initialData.name || "",
        description: initialData.description || "",
        rating: initialData.rating || 0,
        order: initialData.order || 0,
      });

      setPreview(getImageUrl(initialData.image));
      setImageFile(null);
    } else {
      setForm({
        name: "",
        description: "",
        rating: 0,
        order: 0,
      });

      setPreview(null);
      setImageFile(null);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleChange = (key: keyof Testimonial, value: any) => {
    setForm((prev) => ({
      ...prev,
      [key]: key === "rating" || key === "order" ? Number(value) : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setPreview(URL.createObjectURL(file));
    setRemoveImage(false);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setErrors({});

      const url = isEdit
        ? `${API_URL}/admin/testimonials/${initialData?.id}`
        : `${API_URL}/admin/testimonials`;

      const formData = new FormData();

      formData.append("name", form.name || "");
      formData.append("description", form.description || "");
      formData.append("rating", String(form.rating || 0));
      formData.append("order", String(form.order || 0));

      if (imageFile) {
        formData.append("image", imageFile);
      }

      if (removeImage) {
        formData.append("remove_image", "1");
      }

      if (isEdit) {
        formData.append("_method", "PUT");
      }

      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      const result = await res.json();

      if (!res.ok) {
        if (result.errors) {
          setErrors(result.errors);
          toast.error("Please fix validation errors");
          return;
        }
        throw new Error(result.message || "Something went wrong");
      }

      toast.success(isEdit ? "Updated successfully" : "Created successfully");

      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-lg cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-[95vw] max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl p-8 bg-white/5 border border-white/10 backdrop-blur-xl cursor-default"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
          <div className="flex items-center gap-2 font-semibold text-xl text-primary">
            {isEdit ? <Pencil /> : <Plus />}
            {isEdit ? "Edit Testimonial" : "Add Testimonial"}
          </div>

          <button onClick={onClose}>
            <X className="text-white/70 hover:text-white" />
          </button>
        </div>

        {/* Image Section */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative w-28 h-28">
            {/* Preview */}
            <div className="w-28 h-28 rounded-full border border-white/20 overflow-hidden flex items-center justify-center bg-white/5">
              {preview ? (
                <img
                  src={preview}
                  alt="preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-10 h-10 text-white/40" />
              )}
            </div>

            {/* Upload */}
            <label className="absolute bottom-0 right-0 bg-gradient-to-r from-primary to-secondary p-2 rounded-full cursor-pointer shadow-lg hover:scale-110 transition">
              <input type="file" hidden onChange={handleImageChange} />
              <ImageIcon className="w-4 h-4 text-white" />
            </label>

            {/* Remove */}
            {preview && (
              <button
                type="button"
                onClick={() => {
                  setPreview(null);
                  setImageFile(null);
                  setRemoveImage(true);
                }}
                className="absolute top-0 right-0 bg-red-500 text-white text-xs px-2 py-1 rounded-full"
              >
                Remove
              </button>
            )}
          </div>

          <p className="text-xs text-white/50 mt-2">Upload or remove image</p>
        </div>

        {/* Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <InputField
            label="Name"
            icon={User}
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />

          <InputField
            label="Rating"
            icon={Star}
            type="number"
            value={form.rating}
            onChange={(e) => handleChange("rating", e.target.value)}
          />

          <InputField
            label="Order"
            icon={Star}
            type="number"
            value={form.order}
            onChange={(e) => handleChange("order", e.target.value)}
          />

          <div className="md:col-span-2">
            <InputField
              label="Description"
              icon={FileText}
              textarea
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg text-white/80 bg-white/5 hover:bg-white/10"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2 rounded-lg text-white bg-gradient-to-r from-primary to-secondary"
          >
            {loading ? "Saving..." : isEdit ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestimonialAddEdit;
