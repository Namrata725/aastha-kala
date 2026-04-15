"use client";

import React, { useEffect, useState } from "react";
import InputField from "@/components/layout/InputField";
import EditorComponent from "@/components/layout/EditorComponent";
import { X, AlignLeft } from "lucide-react";
import toast from "react-hot-toast";

interface EventData {
  id?: number;
  title: string;
  description?: string;
  event_date: string;
  location: string;
  status: "draft" | "published";
  is_active: boolean;
  banner?: File | string | null;
  contact_person_name?: string;
  contact_person_phone?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  event?: any;
}

const EventAddEditModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSuccess,
  event,
}) => {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
  const IMAGE_BASE = process.env.NEXT_PUBLIC_IMAGE_URL;

  const [form, setForm] = useState<EventData>({
    title: "",
    description: "",
    event_date: "",
    location: "",
    status: "draft",
    is_active: false,
    banner: null,
    contact_person_name: "",
    contact_person_phone: "",
  });

  const [previewBanner, setPreviewBanner] = useState<string | null>(null);
const [errors, setErrors] = useState<{[key: string]: string[]}>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (event) {
      setForm({
        title: event.title || "",
        description: event.description || "",
        event_date: event.event_date
          ? new Date(event.event_date).toISOString().slice(0, 16)
          : "",
        location: event.location || "",
        status: event.status || "draft",
        contact_person_name: event.contact_person_name || "",
        contact_person_phone: event.contact_person_phone || "",
        is_active: event.is_active || false,
        banner: null,
      });

      setPreviewBanner(
        event.banner
          ? event.banner.startsWith("http")
            ? event.banner
            : `${IMAGE_BASE}/${event.banner}`
          : null,
      );
    } else {
      setForm({
        title: "",
        description: "",
        event_date: "",
        location: "",
        status: "draft",
        contact_person_phone: "",
        is_active: false,
        banner: null,
      });
      setPreviewBanner(null);
    }
  }, [event, isOpen]);

  if (!isOpen) return null;

  const handleChange = (key: string, value: any) => {
    if (loading) return;
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };


  const handleBannerChange = (file: File | null) => {
    if (loading) return;
    handleChange("banner", file);

    if (file) {
      setPreviewBanner(URL.createObjectURL(file));
    }
  };


  // REMOVE BANNER
  const handleRemoveBanner = () => {
    if (loading) return;
    setForm((prev) => ({
      ...prev,
      banner: null,
    }));
    setPreviewBanner(null);
  };


  const handleSubmit = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description || "");
      formData.append("event_date", form.event_date);
      formData.append("location", form.location);
      formData.append("status", form.status);
      formData.append("is_active", form.is_active ? "1" : "0");

      // ✅ contact fields
      formData.append("contact_person_name", form.contact_person_name || "");
      formData.append("contact_person_phone", form.contact_person_phone || "");

      // banner upload
      if (form.banner instanceof File) {
        formData.append("banner", form.banner);
      }

      // optional: remove existing banner
      if (event && !previewBanner && !form.banner) {
        formData.append("remove_banner", "1");
      }

      const url = event
        ? `${BASE_URL}/admin/events/${event.id}`
        : `${BASE_URL}/admin/events`;

      const method = "POST";

      if (event) {
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
          const validationErrors = result.errors as Record<string, string[]>;
          setErrors(validationErrors);
          const firstError = Object.values(validationErrors)[0]?.[0] || result.message || "Validation failed";
          toast.error(firstError);
          return;
        }
        throw new Error(result.message || "Something went wrong");
      }

      toast.success(event ? "Updated successfully" : "Created successfully");

      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      // onClick={onClose}
      className="fixed inset-0 bg-white/5 backdrop-blur-lg border border-white/10 flex items-center justify-center z-50 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-primary/10 border border-primary/20 backdrop-blur-md w-full max-w-2xl rounded-xl p-6 relative overflow-y-auto max-h-[90vh] cursor-default"
      >
        {/* Close Modal */}
        <button onClick={onClose} className="absolute right-4 top-4 text-primary hover:text-black transition-colors">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold mb-6 text-primary">
          {event ? "Edit Event" : "Add Event"}
        </h2>

        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
<InputField
              label="Title"
              required={true}
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              disabled={loading}
              error={errors.title}
            />

            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title[0]}</p>}

<InputField
              label="Location"
              required={true}
              value={form.location}
              onChange={(e) => handleChange("location", e.target.value)}
              disabled={loading}
              error={errors.location}
            />

            {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location[0]}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
<InputField
              label="Event Date"
              type="datetime-local"
              required={true}
              value={form.event_date}
              onChange={(e) => handleChange("event_date", e.target.value)}
              disabled={loading}
              error={errors.event_date}
            />

            <InputField
              label="Status"
              type="select"
              value={form.status}
              onChange={(e) => handleChange("status", e.target.value)}
              options={[
                { label: "Draft", value: "draft" },
                { label: "Published", value: "published" },
              ]}
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Overlay Ad Active"
              type="select"
              value={form.is_active ? "1" : "0"}
              onChange={(e) => handleChange("is_active", e.target.value === "1")}
              options={[
                { label: "Disabled", value: "0" },
                { label: "Active (Show as Popup)", value: "1" },
              ]}
              disabled={loading}
            />
          </div>

          <EditorComponent
            label="Description"
            icon={AlignLeft}
            value={form.description || ""}
            onChange={(val: string) => handleChange("description", val)}
          />


          {/* Banner Upload */}
          <div>
            <label className="text-sm text-primary font-bold mb-1 block uppercase tracking-wider italic">
              Banner Image
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={(e: any) =>
                handleBannerChange(e.target.files?.[0] || null)
              }
              disabled={loading}
              className="text-black/60 file:mr-4 cursor-pointer file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />


            {previewBanner && (
              <div className="mt-3 relative w-32 h-20">
                <img
                  src={previewBanner}
                  className="w-32 h-20 object-cover rounded"
                />

                {/* Remove button */}
                <button
                  type="button"
                  onClick={handleRemoveBanner}
                  disabled={loading}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ✕
                </button>

              </div>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-2 bg-gradient-to-r cursor-pointer from-primary to-secondary text-white rounded-lg"
          >
            {loading ? "Saving..." : event ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventAddEditModal;
