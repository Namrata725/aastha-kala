"use client";

import React, { useEffect, useState } from "react";
import InputField from "@/components/layout/InputField";
import { X } from "lucide-react";
import toast from "react-hot-toast";

interface Category {
  id: number;
  name: string;
}

interface Gallery {
  id?: number;
  title: string;
  type: string;
  position?: string;
  video?: string;
  category_id?: string;
  images?: File[] | string[];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: any;
  categories: Category[];
}

const GalleryAddEditModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSuccess,
  editData,
  categories,
}) => {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  const [form, setForm] = useState<Gallery>({
    title: "",
    type: "images",
    position: "",
    video: "",
    category_id: "",
    images: [],
  });

  const [loading, setLoading] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  useEffect(() => {
    if (editData) {
      setForm({
        title: editData.title || "",
        type: editData.type || "images",
        position: editData.position || "",
        video: editData.video || "",
        category_id: editData.category?.id?.toString() || "",
        images: [],
      });

      if (editData.images) {
        setPreviewImages(editData.images);
      }
    } else {
      setForm({
        title: "",
        type: "images",
        position: "",
        video: "",
        category_id: "",
        images: [],
      });
      setPreviewImages([]);
    }
  }, [editData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (key: string, value: any) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleFileChange = (files: File[]) => {
    handleChange("images", files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setPreviewImages(previews);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("type", form.type);
      formData.append("position", form.position || "");
      formData.append("category_id", form.category_id || "");

      if (form.type === "video") {
        formData.append("video", form.video || "");
      }

      if (form.type === "images" && form.images && form.images.length > 0) {
        form.images.forEach((file: any) => {
          formData.append("images[]", file);
        });
      }

      const url = editData
        ? `${BASE_URL}/admin/galleries/${editData.id}`
        : `${BASE_URL}/admin/galleries`;

      const method = "POST";

      if (editData) {
        formData.append("_method", "PUT");
      }

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: formData,
      });

      const result = await res.json();

      if (!res.ok) {
        if (result.errors) {
          const firstError = Object.values(result.errors)[0] as string[];
          throw new Error(firstError[0]);
        }
        throw new Error(result.message || "Something went wrong");
      }

      toast.success(editData ? "Updated successfully" : "Created successfully");

      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const categoryOptions = categories.map((c) => ({
    label: c.name,
    value: c.id.toString(),
  }));

  return (
    <div className="fixed inset-0 bg-white/5 backdrop-blur-lg border border-white/10 flex items-center justify-center z-50">
      <div className="bg-primary/10 border border-primary/20 backdrop-blur-md w-full max-w-2xl rounded-xl p-6 relative overflow-y-auto max-h-[90vh]">
        {/* Close */}
        <button onClick={onClose} className="absolute right-4 top-4 text-white">
          <X />
        </button>

        <h2 className="text-xl font-bold mb-6 text-primary">
          {editData ? "Edit Gallery" : "Add Gallery"}
        </h2>

        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Title"
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
            />

            <InputField
              label="Type"
              type="select"
              value={form.type}
              onChange={(e) => handleChange("type", e.target.value)}
              options={[
                { label: "Image", value: "images" },
                { label: "Video", value: "video" },
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Category"
              type="select"
              value={form.category_id}
              onChange={(e) => handleChange("category_id", e.target.value)}
              options={categoryOptions}
            />

            <InputField
              label="Position"
              type="select"
              value={form.position}
              onChange={(e) => handleChange("position", e.target.value)}
              options={[
                { label: "slider-home", value: "slider-home" },
                { label: "about-home", value: "about-home" },
                { label: "about-intro", value: "about-intro" },
                { label: "gallery", value: "gallery" },
              ]}
            />
          </div>

          {form.type === "video" && (
            <InputField
              label="Video URL"
              value={form.video}
              onChange={(e) => handleChange("video", e.target.value)}
            />
          )}

          {form.type === "images" && (
            <div>
              <label className="text-sm text-white mb-1 block">
                Upload Images
              </label>

              <input
                type="file"
                multiple
                onChange={(e: any) =>
                  handleFileChange(Array.from(e.target.files))
                }
                className="text-white"
              />

              {previewImages.length > 0 && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  {previewImages.map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      className="w-20 h-20 object-cover rounded"
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg"
          >
            {loading ? "Saving..." : editData ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GalleryAddEditModal;
