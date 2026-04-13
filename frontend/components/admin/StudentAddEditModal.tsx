"use client";

import React, { useEffect, useState } from "react";
import InputField from "@/components/layout/InputField";
import { X, User, Phone, MapPin, Mail, Calendar, Clock, BookOpen, Star, Search, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

interface StudentData {
  id?: number;
  name: string;
  phone: string;
  email?: string;
  dob?: string;
  address?: string;
  time?: string;
  offer_enroll_reference?: string;
  gender?: string;
  classes?: string;
  enrollment_date?: string;
  duration_value?: string | number;
  duration_unit?: string;
  status: "active" | "inactive" | "graduated";
  image?: File | string | null;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  student?: any;
}

const StudentAddEditModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSuccess,
  student,
}) => {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
  const IMAGE_BASE = process.env.NEXT_PUBLIC_IMAGE_URL;

  const [form, setForm] = useState<StudentData>({
    name: "",
    phone: "",
    email: "",
    dob: "",
    address: "",
    time: "",
    offer_enroll_reference: "",
    gender: "",
    classes: "",
    enrollment_date: new Date().toISOString().split('T')[0],
    duration_value: "",
    duration_unit: "",
    status: "active",
    image: null,
  });

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [errors, setErrors] = useState<{[key: string]: string[]}>({});
  const [loading, setLoading] = useState(false);

  // Booking Import State
  const [showBookingList, setShowBookingList] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);
  const [fetchingBookings, setFetchingBookings] = useState(false);
  const [bookingSearch, setBookingSearch] = useState("");

  // Programs State
  const [programs, setPrograms] = useState<any[]>([]);

  const fetchBookings = async () => {
    try {
      setFetchingBookings(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/admin/bookings?status=accepted`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" }
      });
      const data = await res.json();
      setBookings(data.data?.data || data.data || []);
      setShowBookingList(true);
    } catch (error) {
      toast.error("Failed to fetch bookings");
    } finally {
      setFetchingBookings(false);
    }
  };

  const selectBooking = (b: any) => {
    setForm({
      ...form,
      name: b.name || "",
      phone: b.phone || "",
      email: b.email || "",
      address: b.address || "",
      classes: b.program?.title || "",
      duration_value: b.duration_value !== null && b.duration_value !== undefined ? String(b.duration_value) : "",
      duration_unit: b.duration_unit || "",
      offer_enroll_reference: `Booking ID: ${b.id}`,
    });
    setShowBookingList(false);
    toast.success(`Imported data for ${b.name}`);
  };

  const filteredBookings = bookings.filter(b => 
    b.name.toLowerCase().includes(bookingSearch.toLowerCase()) || 
    b.phone.includes(bookingSearch)
  );

  const fetchPrograms = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/programs`);
      const data = await res.json();
      setPrograms(data.data?.data || data.data || []);
    } catch (error) {
      console.error("Failed to fetch programs:", error);
    }
  };

  useEffect(() => {
    fetchPrograms();
    if (student) {
      setForm({
        name: student.name || "",
        phone: student.phone || "",
        email: student.email || "",
        dob: student.dob ? student.dob.split('T')[0] : "",
        address: student.address || "",
        time: student.time || "",
        offer_enroll_reference: student.offer_enroll_reference || "",
        gender: student.gender || "",
        classes: student.classes || "",
        enrollment_date: student.enrollment_date ? student.enrollment_date.split('T')[0] : "",
        duration_value: student.duration_value || "",
        duration_unit: student.duration_unit || "",
        status: student.status || "active",
        image: null,
      });

      setPreviewImage(student.image_url || null);
    } else {
      setForm({
        name: "",
        phone: "",
        email: "",
        dob: "",
        address: "",
        time: "",
        offer_enroll_reference: "",
        gender: "",
        classes: "",
        enrollment_date: new Date().toISOString().split('T')[0],
        duration_value: "",
        duration_unit: "",
        status: "active",
        image: null,
      });
      setPreviewImage(null);
    }
  }, [student, isOpen]);

  if (!isOpen) return null;

  const handleChange = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleClass = (title: string) => {
    const currentClasses = form.classes ? form.classes.split(',').map(c => c.trim()).filter(c => c) : [];
    let newClasses;
    if (currentClasses.includes(title)) {
      newClasses = currentClasses.filter(c => c !== title);
    } else {
      newClasses = [...currentClasses, title];
    }
    setForm(prev => ({ ...prev, classes: newClasses.join(', ') }));
  };

  const isClassSelected = (title: string) => {
    return form.classes ? form.classes.split(',').map(c => c.trim()).includes(title) : false;
  };

  const handleImageChange = (file: File | null) => {
    setForm((prev) => ({ ...prev, image: file }));
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setErrors({});
      const token = localStorage.getItem("token");

      const formData = new FormData();
      console.log("Submitting form:", form);
      Object.keys(form).forEach(key => {
          if (key === 'image') {
              if (form.image instanceof File) {
                  formData.append("image", form.image);
              }
          } else {
              formData.append(key, (form as any)[key] || "");
          }
      });

      if (student) {
        formData.append("_method", "PUT");
      }

      const url = student
        ? `${BASE_URL}/admin/students/${student.id}`
        : `${BASE_URL}/admin/students`;

      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: formData,
      });

      const result = await res.json();

      if (!res.ok) {
        if (result.errors) {
          setErrors(result.errors);
          // Better error extraction
          const errorValues = Object.values(result.errors).flat();
          const firstError = errorValues[0] as string;
          toast.error(firstError || "Validation failed");
        } else {
          toast.error(result.message || "Something went wrong");
        }
        return;
      }

      toast.success(student ? "Student updated" : "Student created");
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 cursor-pointer" onClick={onClose}>
      <div className="bg-white w-full max-w-3xl rounded-[2rem] p-8 relative overflow-y-auto max-h-[90vh] cursor-default shadow-2xl transition-all" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute right-6 top-6 text-gray-400 hover:text-black transition-colors p-2 bg-gray-50 rounded-full">
          <X className="w-5 h-5" />
        </button>

        <div className="mb-8">
            <h2 className="text-3xl font-black text-gray-900 leading-tight">
                {student ? "Update Student" : "New Enrollment"}
            </h2>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
                <p className="text-gray-500 font-medium">Please fill in the student details below.</p>
                {!student && (
                    <button 
                        onClick={fetchBookings}
                        disabled={fetchingBookings}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                    >
                        {fetchingBookings ? "Searching..." : (
                            <>
                                <Search className="w-3.5 h-3.5" />
                                Pull from Booking
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>

        {/* Booking Selection Overlay */}
        {showBookingList && (
            <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm p-8 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-xl font-black text-gray-900">Select a Booking</h3>
                        <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Import data quickly</p>
                    </div>
                    <button onClick={() => setShowBookingList(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                        type="text"
                        placeholder="Search by name or phone..."
                        value={bookingSearch}
                        onChange={(e) => setBookingSearch(e.target.value)}
                        className="w-full bg-gray-50 border-none rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 shadow-inner"
                    />
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                    {filteredBookings.length > 0 ? filteredBookings.map((b: any) => (
                        <button 
                            key={b.id}
                            onClick={() => selectBooking(b)}
                            className="w-full flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl hover:border-blue-500 hover:shadow-md transition-all group text-left"
                        >
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center mr-4 group-hover:bg-blue-600 transition-colors">
                                    <User className="w-5 h-5 text-blue-600 group-hover:text-white" />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">{b.name}</p>
                                    <div className="flex items-center gap-3 mt-0.5">
                                        <span className="text-[10px] text-gray-500 flex items-center gap-1">
                                            <Phone className="w-2.5 h-2.5" /> {b.phone}
                                        </span>
                                        <span className="text-[10px] text-blue-600 font-bold uppercase tracking-tighter">
                                            {b.program?.title}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                        </button>
                    )) : (
                        <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                            <BookOpen className="w-10 h-10 mb-2 opacity-20" />
                            <p className="text-sm font-medium">No bookings found</p>
                        </div>
                    )}
                </div>
            </div>
        )}

        <div className="space-y-6">
          {/* Photo Section */}
          <div className="flex flex-col items-center sm:flex-row gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-100">
            <div className="relative group">
                <div className="w-24 h-24 rounded-2xl bg-white shadow-inner flex items-center justify-center overflow-hidden border-2 border-dashed border-slate-200 group-hover:border-blue-500 transition-colors">
                    {previewImage ? (
                        <img src={previewImage} className="w-full h-full object-cover" />
                    ) : (
                        <User className="w-10 h-10 text-slate-300" />
                    )}
                </div>
                <input 
                    type="file" 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                    onChange={(e) => handleImageChange(e.target.files?.[0] || null)}
                    accept="image/*"
                />
            </div>
            <div className="text-center sm:text-left">
                <p className="font-bold text-gray-900">Student Photo</p>
                <p className="text-xs text-gray-500 max-w-[200px]">Upload a clear photo. Recommended size: 500x500px.</p>
                {previewImage && (
                    <button onClick={() => { setPreviewImage(null); setForm({...form, image: null}); }} className="mt-2 text-[10px] font-bold text-red-500 uppercase tracking-tighter hover:underline">Remove Photo</button>
                )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Full Name"
              required
              icon={User}
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              disabled={loading}
              error={errors.name}
            />
            <InputField
              label="Phone Number"
              required
              icon={Phone}
              value={form.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              disabled={loading}
              error={errors.phone}
            />
            <InputField
              label="Email Address"
              icon={Mail}
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              disabled={loading}
              error={errors.email}
            />
            <InputField
              label="Address"
              icon={MapPin}
              value={form.address}
              onChange={(e) => handleChange("address", e.target.value)}
              disabled={loading}
              error={errors.address}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputField
              label="Date of Birth"
              type="date"
              icon={Calendar}
              value={form.dob}
              onChange={(e) => handleChange("dob", e.target.value)}
              disabled={loading}
              error={errors.dob}
            />
            <InputField
              label="Gender"
              type="select"
              icon={User}
              value={form.gender}
              onChange={(e) => handleChange("gender", e.target.value)}
              options={[
                { label: "Male", value: "male" },
                { label: "Female", value: "female" },
                { label: "Other", value: "other" },
              ]}
              disabled={loading}
            />
             <InputField
              label="Preferred Time"
              icon={Clock}
              placeholder="e.g. 7:00 AM"
              value={form.time}
              onChange={(e) => handleChange("time", e.target.value)}
              disabled={loading}
              error={errors.time}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Enrollment Date"
              type="date"
              icon={Calendar}
              value={form.enrollment_date}
              onChange={(e) => handleChange("enrollment_date", e.target.value)}
              disabled={loading}
              error={errors.enrollment_date}
            />
            <InputField
              label="Reference/Notes"
              icon={Star}
              placeholder="How did they find us?"
              value={form.offer_enroll_reference}
              onChange={(e) => handleChange("offer_enroll_reference", e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-4 p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Select Classes/Courses</p>
                </div>
                <p className="text-[10px] font-medium text-gray-400 italic">Select one or more</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {programs.map(p => (
                    <label 
                        key={p.id}
                        className={`flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer bg-white ${
                            isClassSelected(p.title) 
                            ? 'border-blue-500 ring-1 ring-blue-500/10 shadow-sm' 
                            : 'border-slate-200 hover:border-blue-200'
                        }`}
                    >
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                            isClassSelected(p.title) 
                            ? 'bg-blue-600 border-blue-600' 
                            : 'bg-slate-50 border-slate-200'
                        }`}>
                            <input 
                                type="checkbox"
                                className="hidden"
                                checked={isClassSelected(p.title)}
                                onChange={() => toggleClass(p.title)}
                            />
                            {isClassSelected(p.title) && (
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </div>
                        <span className="text-xs font-bold text-gray-700">
                            {p.title}
                        </span>
                    </label>
                ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Duration Value"
                type="number"
                placeholder="e.g. 3"
                icon={Clock}
                value={form.duration_value}
                onChange={(e) => handleChange("duration_value", e.target.value)}
                disabled={loading}
              />
              <InputField
                label="Duration Unit"
                type="select"
                icon={Calendar}
                value={form.duration_unit}
                onChange={(e) => handleChange("duration_unit", e.target.value)}
                options={[
                    { label: "Days", value: "days" },
                    { label: "Months", value: "months" },
                    { label: "Years", value: "years" },
                ]}
                disabled={loading}
              />
          </div>

          <InputField
            label="Enrollment Status"
            type="select"
            value={form.status}
            onChange={(e) => handleChange("status", e.target.value)}
            options={[
                { label: "Active", value: "active" },
                { label: "Inactive", value: "inactive" },
                { label: "Graduated", value: "graduated" },
            ]}
            disabled={loading}
            error={errors.status}
          />

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-4 bg-blue-600 hover:bg-black text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-100 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? "Processing..." : student ? "Update Records" : "Confirm Enrollment"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentAddEditModal;
