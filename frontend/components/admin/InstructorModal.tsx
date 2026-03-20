"use client";

import React, { useEffect, useState } from "react";
import {
  X,
  UserPlus,
  Pencil,
  User,
  Mail,
  Phone,
  Captions,
  Facebook,
  Instagram,
  FileTypeCorner,
} from "lucide-react";
import toast from "react-hot-toast";
import InputField from "../layout/InputField";

interface Instructor {
  id?: number;
  name: string;
  title?: string;
  about?: string;
  email?: string;
  phone?: string;
  facebook_url?: string;
  instagram_url?: string;
  image?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  instructor?: Instructor | null;
}

const InstructorModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSuccess,
  instructor,
}) => {
  const isEdit = !!instructor;

  const [form, setForm] = useState<Instructor>({
    name: "",
    title: "",
    email: "",
    phone: "",
    about: "",
    facebook_url: "",
    instagram_url: "",
  });

  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (instructor) {
      setForm(instructor);

      if (instructor.image) {
        const imageUrl = instructor.image.startsWith("http")
          ? instructor.image
          : `${process.env.NEXT_PUBLIC_IMAGE_URL?.replace(/\/$/, "")}/${instructor.image}`;

        setPreview(imageUrl);
      }
    } else {
      setForm({
        name: "",
        title: "",
        email: "",
        phone: "",
        about: "",
        facebook_url: "",
        instagram_url: "",
      });
      setPreview(null);
      setImage(null);
    }
  }, [instructor]);

  if (!isOpen) return null;

  const handleChange = (key: keyof Instructor, value: any) => {
    setForm((prev) => ({
      ...prev,
      [key]: typeof value === "string" ? value : "",
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const url = isEdit
        ? `${process.env.NEXT_PUBLIC_API_URL}/admin/instructors/${instructor?.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/admin/instructors`;

      const formData = new FormData();

      formData.append("name", form.name || "");
      formData.append("title", form.title || "");
      formData.append("email", form.email || "");
      formData.append("phone", form.phone || "");
      formData.append("about", form.about || "");
      formData.append("facebook_url", form.facebook_url || "");
      formData.append("instagram_url", form.instagram_url || "");

      if (image) {
        formData.append("image", image);
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
          Object.entries(result.errors).forEach(([field, messages]: any) => {
            messages.forEach((msg: string) => {
              toast.error(`${field}: ${msg}`);
            });
          });
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-lg">
      {/* Modal Container */}
      <div
        className="w-[95vw] max-w-5xl rounded-2xl p-8"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.05), rgba(0,0,0,0.2))",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
          <div className="flex items-center gap-2 font-semibold text-xl text-primary">
            {isEdit ? <Pencil /> : <UserPlus />}
            {isEdit ? "Edit Instructor" : "Add Instructor"}
          </div>

          <button onClick={onClose}>
            <X className="text-white/70 hover:text-white" />
          </button>
        </div>

        {/* Image Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <div className="w-32 h-32 rounded-full border border-white/20 overflow-hidden flex items-center justify-center bg-white/5">
              {preview ? (
                <img src={preview} className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-white/40" />
              )}
            </div>

            <label className="absolute bottom-0 right-0 bg-gradient-to-r from-primary to-secondary p-2 rounded-full cursor-pointer">
              <input type="file" hidden onChange={handleImageChange} />
              <User className="w-4 h-4 text-white" />
            </label>
          </div>

          <p className="text-xs text-white/50 mt-2">Upload profile image</p>
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
            label="Title"
            icon={Captions}
            value={form.title}
            onChange={(e) => handleChange("title", e.target.value)}
          />

          <InputField
            label="Phone"
            icon={Phone}
            value={form.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
          />

          <InputField
            label="Email"
            icon={Mail}
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
          />

          <InputField
            label="Facebook URL"
            icon={Facebook}
            value={form.facebook_url || ""}
            onChange={(e) => handleChange("facebook_url", e.target.value)}
          />

          <InputField
            label="Instagram URL"
            icon={Instagram}
            value={form.instagram_url || ""}
            onChange={(e) => handleChange("instagram_url", e.target.value)}
          />

          <div className="md:col-span-2">
            <InputField
              label="About"
              icon={FileTypeCorner}
              textarea
              value={form.about}
              onChange={(e) => handleChange("about", e.target.value)}
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

export default InstructorModal;
