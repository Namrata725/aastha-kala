"use client";

import React, { useState } from "react";
import {
  X,
  CheckCircle2,
  Clock,
  Users,
  Monitor,
  MapPin,
  ChevronDown,
  Lock,
  Calendar,
} from "lucide-react";
import toast from "react-hot-toast";

interface Schedule {
  id: number;
  start_time: string;
  end_time: string;
  instructor?: { name: string };
}

interface Program {
  id: number;
  title: string;
  description?: string;
  image?: string;
  speciality?: string[];
  is_active: boolean;
  schedules?: Schedule[];
}

interface Props {
  programs: Program[];
}

// ─── Booking Modal ────────────────────────────────────────────────────────────

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const formatTime12h = (time24: string) => {
  if (!time24) return "";
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

const getTimeOfDay = (time24: string) => {
  if (!time24) return "";
  const [hours] = time24.split(':').map(Number);
  if (hours >= 4 && hours < 12) return "Morning";
  if (hours >= 12 && hours < 17) return "Day";
  if (hours >= 17 && hours < 21) return "Evening";
  return "Night";
};

function BookingModal({
  program,
  onClose,
}: {
  program: Program;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [bookingType, setBookingType] = useState<"regular" | "customization">("regular");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    class_mode: "physical" as "physical" | "online",
    schedule_ids: [] as string[],
    booking_date: "",
    custom_start_time: "",
    custom_end_time: "",
    duration_value: "",
    duration_unit: "",
    instructor_id: "",
    message: "",
    current_address: "",
  });

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload: any = {
        program_id: program.id,
        name: form.name,
        email: form.email,
        phone: form.phone,
        class_mode: form.class_mode,
        booking_date: form.booking_date,
        duration_value: parseInt(form.duration_value) || 1,
        duration_unit: form.duration_unit,
        type: bookingType,
        message: `${form.message}${form.current_address ? `\n\nAddress: ${form.current_address}` : ""}`,
      };

      if (bookingType === "regular") {
        payload.schedule_ids = form.schedule_ids;
      } else {
        payload.custom_start_time = form.custom_start_time;
        payload.custom_end_time = form.custom_end_time;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Booking failed");
      setSuccess(true);
    } catch (err: any) {
      toast.error(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition placeholder:text-gray-400";
  const labelCls = "block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-8 py-5 flex justify-between items-center rounded-t-3xl">
          <div>
            <p className="text-xs font-bold text-primary uppercase tracking-widest">Book Your Class</p>
            <h2 className="text-xl font-bold text-primary mt-0.5">{program.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="flex flex-col items-center justify-center py-16 px-8 text-center space-y-5">
            <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center animate-bounce-once">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Booking Received!</h3>
            <p className="text-gray-500 max-w-sm text-sm leading-relaxed">
              Thank you, <strong>{form.name}</strong>! Your request for{" "}
              <strong>{program.title}</strong> has been submitted. We'll confirm your slot shortly.
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-8 py-3 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl hover:opacity-90 transition"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-8 py-7 space-y-6">
            {/* Booking Type Toggle */}
            <div>
              <p className={labelCls}>Class Type</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "regular", label: "Fixed Schedule", icon: <Calendar className="w-4 h-4" /> },
                  { value: "customization", label: "Private Class", icon: <Lock className="w-4 h-4" /> },
                ].map(({ value, label, icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setBookingType(value as any)}
                    className={`flex items-center gap-2.5 justify-center p-3.5 rounded-xl border-2 font-semibold text-sm transition ${bookingType === value
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-gray-100 text-gray-500 hover:border-gray-300"
                      }`}
                  >
                    {icon} {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Personal Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelCls}>Full Name *</label>
                <input required className={inputCls} placeholder="Your full name" value={form.name} onChange={(e) => set("name", e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Phone Number *</label>
                <input required type="tel" className={inputCls} placeholder="98XXXXXXXX" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>Email Address</label>
                <input type="email" className={inputCls} placeholder="you@email.com" value={form.email} onChange={(e) => set("email", e.target.value)} />
              </div>
            </div>

            {/* Mode */}
            <div>
              <p className={labelCls}>Class Mode</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "physical", label: "Physical", icon: <Users className="w-4 h-4" /> },
                  { value: "online", label: "Online", icon: <Monitor className="w-4 h-4" /> },
                ].map(({ value, label, icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => set("class_mode", value)}
                    className={`flex items-center gap-2.5 justify-center p-3.5 rounded-xl border-2 font-semibold text-sm transition ${form.class_mode === value
                        ? "border-secondary bg-secondary/5 text-secondary"
                        : "border-gray-100 text-gray-500 hover:border-gray-300"
                      }`}
                  >
                    {icon} {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Booking Date */}
            <div>
              <label className={labelCls}>Preferred Start Date *</label>
              <input
                required
                type="date"
                min={new Date().toISOString().split("T")[0]}
                className={inputCls}
                value={form.booking_date}
                onChange={(e) => set("booking_date", e.target.value)}
              />
            </div>

            {/* Schedule (regular) or Custom Time (private) */}
            {bookingType === "regular" ? (
              <div>
                {program.schedules && program.schedules.length > 0 ? (
                  <div className="space-y-2">
                    {program.schedules.map((s) => (
                      <label
                        key={s.id}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition ${form.schedule_ids.includes(String(s.id))
                            ? "border-primary bg-primary/5"
                            : "border-gray-100 hover:border-gray-200"
                          }`}
                      >
                        <input
                          type="checkbox"
                          value={s.id}
                          checked={form.schedule_ids.includes(String(s.id))}
                          onChange={(e) => {
                            const val = String(s.id);
                            const current = [...form.schedule_ids];
                            if (e.target.checked) {
                              setForm({ ...form, schedule_ids: [...current, val] });
                            } else {
                              setForm({ ...form, schedule_ids: current.filter(id => id !== val) });
                            }
                          }}
                          className="accent-primary w-4 h-4 rounded"
                        />
                        <div className="flex-1">
                          <p className="text-sm text-primary font-bold flex items-center gap-2">
                             <Clock className="w-4 h-4 text-secondary" />
                             {formatTime12h(s.start_time)} – {formatTime12h(s.end_time)}
                          </p>
                          {s.instructor && (
                            <p className="text-xs text-gray-400 mt-1 italic pl-6">
                              Lead Instructor: {s.instructor.name}
                            </p>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-700 text-center">
                    No fixed schedules available for this program yet.
                  </div>
                )}
              </div>
            ) : (
              <div>
                <label className={labelCls}>Preferred Time *</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">From</p>
                    <input required type="time" className={inputCls} value={form.custom_start_time} onChange={(e) => set("custom_start_time", e.target.value)} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">To</p>
                    <input required type="time" className={inputCls} value={form.custom_end_time} onChange={(e) => set("custom_end_time", e.target.value)} />
                  </div>
                </div>
                <p className="mt-2 text-xs text-gray-400 italic">
                  * Private class availability depends on instructor's schedule. We will confirm after review.
                </p>
              </div>
            )}

            {/* Program Duration */}
            {bookingType === "customization" && (
              <div>
                <label className={labelCls}>How long do you plan to take this program? *</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Unit</p>
                    <select className={inputCls} value={form.duration_unit} onChange={(e) => set("duration_unit", e.target.value)}>
                      <option value="" disabled>Select Unit</option>
                      <option value="days">Days</option>
                      <option value="months">Months</option>
                      <option value="years">Years</option>
                    </select>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Duration</p>
                    <input
                      required
                      type="number"
                      min="1"
                      className={`${inputCls} ${!form.duration_unit ? "opacity-50 cursor-not-allowed bg-gray-50" : ""}`}
                      disabled={!form.duration_unit}
                      placeholder={!form.duration_unit ? "Choose Unit first" : "Enter duration"}
                      value={form.duration_value}
                      onChange={(e) => set("duration_value", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Current Address */}
            <div>
              <label className={labelCls}>
                <MapPin className="w-3 h-3 inline mr-1 mb-0.5" />
                Current Address {form.class_mode === "physical" ? "*" : "(optional)"}
              </label>
              <input
                type="text"
                required={form.class_mode === "physical"}
                className={inputCls}
                placeholder="City / Street / Tole"
                value={form.current_address}
                onChange={(e) => set("current_address", e.target.value)}
              />
            </div>

            {/* Comment */}
            <div>
              <label className={labelCls}>Additional Message</label>
              <textarea
                rows={3}
                className={inputCls + " resize-none"}
                placeholder="Any special requests or questions..."
                value={form.message}
                onChange={(e) => set("message", e.target.value)}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl hover:opacity-90 transition text-sm tracking-wide disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Confirm Booking Request"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Program Card ─────────────────────────────────────────────────────────────

function ProgramCard({ program, onBook, index }: { program: Program; onBook: () => void; index: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`flex flex-col ${index % 2 !== 0 ? "md:flex-row-reverse" : "md:flex-row"} gap-0 bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300`}>
      {/* Image */}
      <div className="md:w-80 w-full shrink-0 relative overflow-hidden">
        {program.image ? (
          <img
            src={program.image}
            alt={program.title}
            className="w-full h-56 md:h-full object-cover"
          />
        ) : (
          <div className="w-full h-56 md:h-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
            <span className="text-5xl font-black text-primary/20">{program.title.charAt(0)}</span>
          </div>
        )}
        {/* Gradient overlay on image */}
        <div className={`absolute inset-0 bg-gradient-to-${index % 2 !== 0 ? "l" : "r"} from-transparent to-white/20 md:block hidden`} />
      </div>

      {/* Content */}
      <div className="flex-1 p-7 flex flex-col gap-4">
        <div>
          <h2 className="text-2xl font-bold text-primary font-poppins">{program.title}</h2>
          <p className="text-lg text-gray-500 mt-2 leading-relaxed">
            {program.description || "Explore this exciting program and develop new skills."}
          </p>
        </div>

        {/* Specialities */}
        {program.speciality && program.speciality.length > 0 && (
          <div>
            <p className="text-lg font-bold text-gray-600 tracking-widest mb-2">What makes it special:</p>
            <ul className="space-y-1">
              {(expanded ? program.speciality : program.speciality.slice(0, 4)).map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-lg text-black">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="mt-auto">
          <button
            onClick={onBook}
            className="px-8 py-1 bg-gradient-to-r from-primary to-secondary text-white font-bold text-sm rounded-xl hover:opacity-90 transition active:scale-95 shadow-sm shadow-primary/20"
          >
            Book Your Class
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ClientPrograms({ programs }: Props) {
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const activePrograms = programs.filter((p) => p.is_active);

  if (activePrograms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-400">
        <Calendar className="w-14 h-14 mb-4 opacity-30" />
        <p className="text-lg font-medium">No programs available at the moment.</p>
        <p className="text-sm mt-1">Please check back soon!</p>
      </div>
    );
  }

  return (
    <section className="container mx-auto px-4 py-14 max-w-5xl space-y-8">

      {activePrograms.map((program, index) => (
        <ProgramCard
          key={program.id}
          program={program}
          index={index}
          onBook={() => setSelectedProgram(program)}
        />
      ))}

      {selectedProgram && (
        <BookingModal
          program={selectedProgram}
          onClose={() => setSelectedProgram(null)}
        />
      )}
    </section>
  );
}
