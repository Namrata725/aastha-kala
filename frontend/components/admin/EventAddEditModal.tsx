"use client";

import React, { useEffect, useState } from "react";
import InputField from "@/components/layout/InputField";
import EditorComponent from "@/components/layout/EditorComponent";
import { X, AlignLeft, Captions, MapPin, Calendar, User, Phone, CheckCircle, Info, Image as ImageIcon } from "lucide-react";
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
  if (!isOpen) return;

  if (event) {
    setForm({
      title: event.title || "",
      description: event.description || "",
      event_date: event.event_date
        ? (() => {
            const d = new Date(event.event_date);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            const hours = String(d.getHours()).padStart(2, '0');
            const minutes = String(d.getMinutes()).padStart(2, '0');
            return `${year}-${month}-${day}T${hours}:${minutes}`;
          })()
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
        : null
    );
  } else {
    setForm({
      title: "",
      description: "",
      event_date: "",
      location: "",
      status: "draft",
      contact_person_name: "",
      contact_person_phone: "",
      is_active: false,
      banner: null,
    });

    setPreviewBanner(null);
  }

  //  clear errors when opening
  setErrors({});
}, [isOpen]); 

  if (!isOpen) return null;

  const handleChange = (key: string, value: any) => {
    if (loading) return;
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

    //clear efrror fo rthat field
    setErrors((prev) =>{
      const newErrors = {...prev};
      delete newErrors[key];
      return newErrors;
    })
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Title"
              icon={Captions}
              required={true}
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              disabled={loading}
              error={errors.title}
            />

            <InputField
              label="Location"
              icon={MapPin}
              required={true}
              value={form.location}
              onChange={(e) => handleChange("location", e.target.value)}
              disabled={loading}
              error={errors.location}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Event Date"
              icon={Calendar}
              type="datetime-local"
              required={true}
              value={form.event_date}
              onChange={(e) => handleChange("event_date", e.target.value)}
              disabled={loading}
              error={errors.event_date}
            />

            <InputField
              label="Status"
              icon={Info}
              type="select"
              value={form.status}
              onChange={(e) => handleChange("status", e.target.value)}
              options={[
                { label: "Draft", value: "draft" },
                { label: "Published", value: "published" },
              ]}
              disabled={loading}
              error={errors.status}
            />
          </div>

          {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Contact Person Name"
              icon={User}
              id="contact_person_name"
              value={form.contact_person_name || ""}
              onChange={(e) => handleChange("contact_person_name", e.target.value)}
              disabled={loading}
              error={errors.contact_person_name}
              placeholder="e.g. John Doe"
            />

            <InputField
              label="Contact Person Phone"
              icon={Phone}
              id="contact_person_phone"
              value={form.contact_person_phone || ""}
              onChange={(e) => handleChange("contact_person_phone", e.target.value)}
              disabled={loading}
              error={errors.contact_person_phone}
              placeholder="e.g. +977-9800000000"
            />
          </div> */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Overlay Ad Active"
              icon={CheckCircle}
              id="is_active"
              type="select"
              value={form.is_active ? "1" : "0"}
              onChange={(e) => handleChange("is_active", e.target.value === "1")}
              options={[
                { label: "Disabled", value: "0" },
                { label: "Active (Show as Popup)", value: "1" },
              ]}
              disabled={loading}
              error={errors.is_active}
            />
          </div>

          <EditorComponent
            label="Description"
            icon={AlignLeft}
            value={form.description || ""}
            onChange={(val: string) => handleChange("description", val)}
          />


          {/* Banner Upload */}
          <div id="banner">
            <label className="text-sm text-primary font-bold mb-1 block uppercase tracking-wider italic flex items-center gap-2">
              <ImageIcon className="w-4 h-4" /> Banner Image
            </label>

            <div className="p-0.5 rounded-xl bg-linear-to-r from-primary/20 to-secondary/20">
              <div className="rounded-xl px-3 py-1.5 bg-primary/10 backdrop-blur-md border border-primary/10 shadow-sm transition-all duration-300">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e: any) =>
                    handleBannerChange(e.target.files?.[0] || null)
                  }
                  disabled={loading}
                  className="text-black/60 file:mr-4 cursor-pointer file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full"
                />
              </div>
            </div>
            
            <div className="min-h-[14px]">
              {errors.banner && (
                <p className="text-red-500 text-[10px] font-bold leading-none mt-1">
                  {errors.banner[0]}
                </p>
              )}
            </div>

            {previewBanner && (
              <div className="mt-3 relative w-full sm:w-48 aspect-video rounded-xl overflow-hidden border border-primary/20 bg-white/10 group">
                <img
                  src={previewBanner}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Remove button */}
                <button
                  type="button"
                  onClick={handleRemoveBanner}
                  disabled={loading}
                  className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg backdrop-blur-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="w-4 h-4" />
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
