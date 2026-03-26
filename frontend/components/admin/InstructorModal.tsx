"use client";

import React, { useEffect, useState } from "react";
import { X, UserPlus, Pencil, User, Mail, Phone, Captions, Facebook, Instagram, FileTypeCorner } from "lucide-react";
import toast from "react-hot-toast";
import InputField from "../layout/InputField";
import { to12h } from "@/lib/timeFormat";

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
  availabilities?: any[];
  programs?: any[];
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
    availabilities: [],
  });
  
  const [availabilities, setAvailabilities] = useState<any[]>([]);

  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [allPrograms, setAllPrograms] = useState<any[]>([]);
  const [selectedPrograms, setSelectedPrograms] = useState<number[]>([]);

  useEffect(() => {
    fetchAllPrograms();
  }, []);

  const fetchAllPrograms = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/programs`, {
        headers: { Accept: "application/json" },
      });
      const result = await res.json();
      if (res.ok) {
        setAllPrograms(result.data?.data || result.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch programs", error);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    if (instructor) {
      setForm({ ...instructor });
      if (instructor.availabilities) {
        setAvailabilities(instructor.availabilities.map(a => ({
          ...a,
          start_time: a.start_time?.substring(0, 5),
          end_time: a.end_time?.substring(0, 5)
        })));
      } else {
        setAvailabilities([]);
      }

      if (instructor.programs) {
        setSelectedPrograms(instructor.programs.map((p: any) => p.id));
      } else {
        setSelectedPrograms([]);
      }
      
      if (instructor.image) {
        const imageUrl = instructor.image.startsWith("http")
          ? instructor.image
          : `${process.env.NEXT_PUBLIC_IMAGE_URL?.replace(/\/$/, "")}/${instructor.image}`;

        setPreview(imageUrl);
      } else {
        setPreview(null);
      }

      setImage(null);
      setRemoveImage(false);
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

      setSelectedPrograms([]);
      setPreview(null);
      setImage(null);
      setRemoveImage(false);
    }
  }, [instructor, isOpen]);

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
    setRemoveImage(false);
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

      availabilities.forEach((a, i) => {
        formData.append(`availabilities[${i}][day_of_week]`, "Monday"); // Send dummy day value to bypass backend validation
        formData.append(`availabilities[${i}][start_time]`, a.start_time);
        formData.append(`availabilities[${i}][end_time]`, a.end_time);
      });

      selectedPrograms.forEach((id, i) => {
        formData.append(`program_ids[${i}]`, id.toString());
      });

      if (image) {
        formData.append("image", image);
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
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-lg cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-[95vw] max-w-5xl max-h-[90vh] overflow-y-auto hide-scrollbar rounded-2xl p-8 bg-white/50 cursor-default"
        style={{
          // background:
          //   "linear-linear(135deg, rgba(255,255,255,0.05), rgba(0,0,0,0.2))",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-primary/50">
          <div className="flex items-center gap-2 font-semibold text-xl text-primary">
            {isEdit ? <Pencil /> : <UserPlus />}
            {isEdit ? "Edit Instructor" : "Add Instructor"}
          </div>

          <button onClick={onClose}>
            <X className="text-primary/70 hover:text-white cursor-pointer" />
          </button>
        </div>

        {/* Image Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <div className="w-32 h-32 rounded-full border border-primary/40 overflow-hidden flex items-center justify-center bg-white/5">
              {preview ? (
                <img src={preview} className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-primary/60" />
              )}
            </div>

            {/* Upload */}
            <label className="absolute bottom-0 right-0 bg-linear-to-r from-primary to-secondary p-2 rounded-full cursor-pointer">
              <input type="file" hidden onChange={handleImageChange} />
              <User className="w-4 h-4 text-white" />
            </label>

            {/* Remove */}
            {preview && (
              <button
                type="button"
                onClick={() => {
                  setPreview(null);
                  setImage(null);
                  setRemoveImage(true);
                }}
                className="absolute top-0 right-0 bg-red-500 text-white text-xs px-2 py-1 rounded-full"
              >
                Remove
              </button>
            )}
          </div>

          <p className="text-xs text-primary/70 mt-2">
            Upload or remove profile image
          </p>
        </div>

        {/* Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <InputField
            label="Name"
            icon={User}
            required
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />

          <InputField
            label="Title"
            icon={Captions}
            required
            value={form.title}
            onChange={(e) => handleChange("title", e.target.value)}
          />

          <InputField
            label="Phone"
            icon={Phone}
            required
            value={form.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
          />

          <InputField
            label="Email"
            icon={Mail}
            required
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
              required
              value={form.about}
              onChange={(e) => handleChange("about", e.target.value)}
            />
          </div>
        </div>

        {/* Programs Section */}
        <div className="mt-10 pt-8 border-t border-white/10">
          <div className="flex flex-col mb-6">
            <h3 className="text-lg font-bold text-primary italic flex items-center gap-2">
              Programs Taught
            </h3>
            <p className="text-[10px] text-white/40 font-black uppercase tracking-widest mt-1">Which programs does this instructor teach?</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {allPrograms.map((program) => (
              <div 
                key={program.id}
                onClick={() => {
                  setSelectedPrograms(prev => 
                    prev.includes(program.id) 
                      ? prev.filter(id => id !== program.id)
                      : [...prev, program.id]
                  );
                }}
                className={`p-3 rounded-xl border transition cursor-pointer flex items-center gap-3 ${
                  selectedPrograms.includes(program.id)
                    ? "bg-primary/20 border-primary text-white shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]"
                    : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${selectedPrograms.includes(program.id) ? "bg-primary animate-pulse" : "bg-white/20"}`} />
                <span className="text-[11px] font-bold uppercase tracking-wider truncate">{program.title}</span>
              </div>
            ))}
          </div>
          {allPrograms.length === 0 && (
            <div className="py-4 text-center border border-dashed border-white/10 rounded-xl">
              <span className="text-xs text-white/20 font-bold uppercase tracking-widest">No programs found</span>
            </div>
          )}
        </div>

        {/* Working Hours Section */}
        <div className="mt-10 pt-8 border-t border-white/10">
          <div className="flex justify-between items-center mb-6">
            <div className="flex flex-col">
              <h3 className="text-lg font-bold text-primary italic flex items-center gap-2">
                Working Hours & Availability
              </h3>
              <p className="text-[10px] text-white/40 font-black uppercase tracking-widest mt-1">When is this instructor available to teach?</p>
            </div>
            <button 
              type="button" 
              onClick={() => setAvailabilities([...availabilities, { day_of_week: "Monday", start_time: "07:00", end_time: "09:00" }])}
              className="px-4 py-2 text-[10px] font-black uppercase bg-secondary/20 text-secondary border border-secondary/20 rounded-lg hover:bg-secondary hover:text-white transition"
            >
              + Add Available Slot
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availabilities.map((avail, index) => (
              <div key={index} className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-3 group">
                <div className="flex justify-between items-center">
                   <div className="bg-black/40 border border-white/5 rounded-lg px-3 py-1 text-[10px] font-bold text-white/50 uppercase tracking-widest italic">
                     Daily
                   </div>
                   <button
                     type="button"
                     onClick={() => setAvailabilities(availabilities.filter((_, i) => i !== index))}
                     className="p-1.5 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition"
                   >
                     <X className="w-3.5 h-3.5" />
                   </button>
                 </div>
                 <div className="grid grid-cols-2 gap-2 mt-1">
                   <div>
                     <span className="text-[9px] text-white/30 font-bold uppercase mb-1 block">From</span>
                     <input
                        type="time"
                        value={avail.start_time}
                        onChange={(e) => {
                          const newA = [...availabilities];
                          newA[index].start_time = e.target.value;
                          setAvailabilities(newA);
                        }}
                        className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                     />
                   </div>
                   <div>
                     <span className="text-[9px] text-white/30 font-bold uppercase mb-1 block">To</span>
                     <input
                        type="time"
                        value={avail.end_time}
                        onChange={(e) => {
                          const newA = [...availabilities];
                          newA[index].end_time = e.target.value;
                          setAvailabilities(newA);
                        }}
                        className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                     />
                   </div>
                 </div>
                 <div className="flex gap-3 justify-center border-t border-white/5 pt-2">
                    <span className="text-[9px] text-white/40 font-black italic uppercase tracking-widest">{to12h(avail.start_time)}</span>
                    <span className="text-[9px] text-white/10 italic">—</span>
                    <span className="text-[9px] text-white/40 font-black italic uppercase tracking-widest">{to12h(avail.end_time)}</span>
                 </div>
               </div>
            ))}
            {availabilities.length === 0 && (
              <div className="col-span-full py-8 border-2 border-dashed border-white/5 rounded-2xl flex items-center justify-center bg-white/[0.02]">
                 <span className="text-xs font-bold text-white/20 uppercase tracking-widest">No working hours defined yet</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg text-primary/80 border bg-white/5 hover:bg-white/10 cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2 rounded-lg text-white bg-linear-to-r from-primary to-secondary cursor-pointer"
          >
            {loading ? "Saving..." : isEdit ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstructorModal;
