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
  title?: string;
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
    title: "",
    description: "",
    rating: 0,
    order: 0,
  });

const [errors, setErrors] = useState<{[key: string]: string[]}>({});
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
      title: initialData.title || "",
      description: initialData.description || "",
        rating: initialData.rating || 0,
        order: initialData.order || 0,
      });

      setPreview(getImageUrl(initialData.image));
      setImageFile(null);
    } else {
      setForm({
      name: "",
      title: "",
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

    // Clear error for this field
    if (errors[key as string]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key as string];
        return newErrors;
      });
    }
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
      formData.append("title", form.title || "");
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
          const validationErrors = result.errors as Record<string, string[]>;
          setErrors(validationErrors);
          
          // Scroll to the first error field
          const firstErrorKey = Object.keys(validationErrors)[0];
          const elementId = firstErrorKey.replace(/\./g, "_");
          
          setTimeout(() => {
            const element = document.getElementById(elementId);
            if (element) {
              element.scrollIntoView({ behavior: "smooth", block: "center" });
            }
          }, 100);
          
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
      // onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-lg cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-[95vw] max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl p-8 bg-white/50 border border-white/20 backdrop-blur-xl cursor-default shadow-2xl"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-2 font-bold text-xl text-primary uppercase italic tracking-tight">
            {isEdit ? <Pencil /> : <Plus />}
            {loading ? (isEdit ? "Updating..." : "Adding...") : (isEdit ? "Edit Testimonial" : "Add Testimonial")}
          </div>

          <button onClick={onClose} disabled={loading} className={`p-1.5 hover:bg-gray-200 rounded-lg transition-colors ${loading ? "opacity-50 cursor-not-allowed" : ""}`}>
            <X className="text-gray-500 hover:text-black" />
          </button>
        </div>

        {/* Image Section */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative w-28 h-28">
            {/* Preview */}
            <div className="w-28 h-28 rounded-full border border-gray-200 overflow-hidden flex items-center justify-center bg-white/40 shadow-inner">
              {preview ? (
                <img
                  src={preview}
                  alt="preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-10 h-10 text-gray-300" />
              )}
            </div>

            {/* Upload */}
            <label className={`absolute bottom-0 right-0 bg-gradient-to-r from-primary to-secondary p-2 rounded-full shadow-lg transition ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-110"}`}>
              <input type="file" hidden onChange={handleImageChange} disabled={loading} />
              <ImageIcon className="w-4 h-4 text-white" />
            </label>

            {/* Remove */}
            {preview && (
              <button
                type="button"
                disabled={loading}
                onClick={() => {
                  setPreview(null);
                  setImageFile(null);
                  setRemoveImage(true);
                }}
                className={`absolute top-0 right-0 bg-red-500 text-white text-xs px-2 py-1 rounded-full ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                Remove
              </button>
            )}
          </div>

          <p className="text-xs text-gray-500 font-medium mt-2">Upload or remove image</p>
        </div>

        {/* Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <InputField
            label="Name"
            icon={User}
            required={true}
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            disabled={loading}
            error={errors.name}
          />

          <InputField
            label="Title"
            icon={FileText}
            value={form.title}
            onChange={(e) => handleChange("title", e.target.value)}
            disabled={loading}
            error={errors.title}
          />

          <InputField
            label="Rating"
            icon={Star}
            type="number"
            required={true}
            value={form.rating}
            onChange={(e) => handleChange("rating", e.target.value)}
            disabled={loading}
            error={errors.rating}
          />

          <InputField
            label="Order"
            icon={Star}
            type="number"
            required={true}
            value={form.order}
            onChange={(e) => handleChange("order", e.target.value)}
            disabled={loading}
            error={errors.order}
          />

          <div className="md:col-span-2">
            <InputField
              label="Description"
              icon={FileText}
              required={true}
              textarea
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              disabled={loading}
              error={errors.description}
            />
          </div>
        </div>


        {/* Footer */}
        <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-white/10">
          <button
            onClick={onClose}
            disabled={loading}
            className={`px-5 py-2 rounded-lg text-gray-700 bg-gray-100 font-bold transition-all ${loading ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-200 cursor-pointer"}`}
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`px-5 py-2 rounded-lg text-white bg-gradient-to-r from-primary to-secondary flex items-center gap-2 transition-all ${
              loading ? "opacity-70 cursor-not-allowed" : "hover:scale-105 active:scale-95 cursor-pointer"
            }`}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {isEdit ? "Updating..." : "Adding..."}
              </>
            ) : (
              isEdit ? "Update" : "Create"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestimonialAddEdit;
