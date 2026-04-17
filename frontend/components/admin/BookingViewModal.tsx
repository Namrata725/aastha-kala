"use client";

import React from "react";
import {
  X, User, Phone, Mail, Calendar, Clock, MapPin, Tag,
  CheckCircle2, XCircle, AlertCircle, AlertTriangle, Edit3,
} from "lucide-react";
import { to12h } from "@/lib/timeFormat";

interface BookingViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: any;
  onStatusUpdate: (status: string, instructorId?: number, customStartTime?: string, customEndTime?: string) => void;
}

const statusColors: any = {
  pending:  "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  accepted: "bg-green-500/10 text-green-500 border-green-500/20",
  rejected: "bg-red-500/10 text-red-500 border-red-500/20",
};

/** Convert "HH:MM" or "HH:MM:SS" → integer minutes */
const toMins = (t?: string): number => {
  if (!t) return 0;
  const [h, m] = t.substring(0, 5).split(":").map(Number);
  return h * 60 + m;
};

const overlaps = (aS: number, aE: number, bS: number, bE: number) =>
  aS < bE && aE > bS;

const BookingViewModal: React.FC<BookingViewModalProps> = ({
  isOpen,
  onClose,
  booking,
  onStatusUpdate,
}) => {
  const [availableInstructors, setAvailableInstructors] = React.useState<any[]>([]);
  const [loadingInstructors, setLoadingInstructors]     = React.useState(false);
  const [selectedInstructorId, setSelectedInstructorId] = React.useState<number | "">("");

  // Editable agreed time (customization bookings only)
  const [agreedStart, setAgreedStart] = React.useState("");
  const [agreedEnd,   setAgreedEnd]   = React.useState("");
  const [editingTime, setEditingTime] = React.useState(false);

  React.useEffect(() => {
    if (isOpen && booking?.id) {
      fetchAvailableInstructors(booking.id);
      const preAssignedId =
        booking.schedule?.instructor_id ||
        booking.schedules?.find((s: any) => s.instructor_id)?.instructor_id;
      setSelectedInstructorId(
        booking.instructor_id || (booking.type === "regular" ? preAssignedId : "") || ""
      );
      // Initialise agreed time from booking
      setAgreedStart(booking.custom_start_time?.substring(0, 5) || "");
      setAgreedEnd(booking.custom_end_time?.substring(0, 5) || "");
      setEditingTime(false);
    } else {
      setAvailableInstructors([]);
      setSelectedInstructorId("");
      setAgreedStart("");
      setAgreedEnd("");
    }
  }, [isOpen, booking?.id, booking?.instructor_id, booking?.type]);

  // Auto-select instructor for regular bookings if not already set once instructors are loaded
  React.useEffect(() => {
    if (isOpen && booking?.type === "regular" && !selectedInstructorId && availableInstructors.length > 0) {
      setSelectedInstructorId(availableInstructors[0].id);
    }
  }, [availableInstructors, selectedInstructorId, booking?.type, isOpen]);

  const fetchAvailableInstructors = async (bookingId: number) => {
    try {
      setLoadingInstructors(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/bookings/${bookingId}/available-instructors`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      const result = await res.json();
      if (res.ok) setAvailableInstructors(result.data || []);
    } catch {
      console.error("Failed to fetch instructors");
    } finally {
      setLoadingInstructors(false);
    }
  };

  if (!isOpen || !booking) return null;

  // ── Determine instructor busy times from selected instructor's free_slots ──
  // free_slots = remaining segments; busy = raw availability MINUS free_slots
  // We don't have raw availability here, so we rely on free_slots as a proxy:
  // show them as "available windows" and warn if agreedTime doesn't fit.
  const selectedInstructor = availableInstructors.find(
    (ins) => ins.id === Number(selectedInstructorId)
  );

  const freeSlots: { start: string; end: string }[] =
    selectedInstructor?.free_slots || [];

  // Check if agreed time fits into any free slot
  const isCustomBooking = booking.type === "customization";
  const timeConflict =
    isCustomBooking &&
    agreedStart &&
    agreedEnd &&
    !freeSlots.some(
      (seg) =>
        toMins(seg.start) <= toMins(agreedStart) &&
        toMins(seg.end) >= toMins(agreedEnd)
    );

  const handleApprove = () => {
    const instId = selectedInstructorId ? Number(selectedInstructorId) : undefined;
    if (isCustomBooking) {
      onStatusUpdate("accepted", instId, agreedStart || undefined, agreedEnd || undefined);
    } else {
      onStatusUpdate("accepted", instId);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-lg cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto hide-scrollbar rounded-2xl p-8 bg-white/50 relative cursor-default"
        style={{ backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.1)" }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-8 border-b border-primary/50 pb-4">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-primary flex items-center gap-2 italic">
              <AlertCircle className="w-5 h-5 text-primary" /> Booking Request Details
            </h2>
            <p className="text-[10px] text-primary/60 uppercase tracking-widest font-black italic">
              Ref ID: BK-{booking.id?.toString().padStart(4, "0")}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full text-primary/60 hover:text-primary transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Section 1: Customer Info */}
          <div className="space-y-6">
            <div>
              <h4 className="text-[11px] font-black text-primary/60 uppercase tracking-widest mb-4 flex items-center gap-2 italic">
                <User className="w-3.5 h-3.5 text-secondary" /> Customer Profile
              </h4>
              <div className="bg-white/40 rounded-xl p-5 border border-primary/20 space-y-5 shadow-sm">
                {[
                  { label: "Full Name",       value: booking.name },
                  { label: "Contact Email",   value: booking.email,   icon: <Mail className="w-3.5 h-3.5 text-primary" /> },
                  { label: "Phone Number",    value: booking.phone,   icon: <Phone className="w-3.5 h-3.5 text-secondary" /> },
                  { label: "Current Address", value: booking.address || "Not provided", icon: <MapPin className="w-3.5 h-3.5 text-primary" /> },
                ].map(({ label, value, icon }) => (
                  <div key={label} className="flex flex-col">
                    <span className="text-[10px] text-primary/60 font-black uppercase tracking-widest italic">{label}</span>
                    <span className="text-sm text-primary font-bold flex items-center gap-2 italic">
                      {icon} {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-[11px] font-black text-primary/60 uppercase tracking-widest mb-4 italic">Request Message</h4>
              <p className="text-sm text-primary/80 bg-white/40 p-5 rounded-xl border border-primary/20 italic font-medium leading-relaxed shadow-sm">
                "{booking.message || "No additional message provided."}"
              </p>
            </div>
          </div>

          {/* Section 2: Class Info */}
          <div className="space-y-6 text-right md:text-left">
            <div>
              <h4 className="text-[11px] font-black text-primary/60 uppercase tracking-widest mb-4 flex items-center gap-2 justify-end md:justify-start italic">
                <Tag className="w-3.5 h-3.5 text-primary" /> Class Selection
              </h4>
              <div className="bg-white/40 rounded-xl p-5 border border-primary/20 space-y-5 shadow-sm">
                <div className="flex flex-col">
                  <span className="text-[10px] text-primary/60 font-black uppercase tracking-widest italic">Program Name</span>
                  <span className="text-md text-secondary font-black uppercase tracking-wider">{booking.program?.title}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-primary/60 font-black uppercase tracking-widest italic">Class Format & Type</span>
                  <div className="flex gap-2 justify-end md:justify-start mt-1">
                    <span className="text-[9px] bg-primary/10 text-primary px-3 py-1 rounded-md border border-primary/20 font-black uppercase tracking-widest italic">{booking.class_mode}</span>
                    <span className="text-[9px] bg-secondary/10 text-secondary px-3 py-1 rounded-md border border-secondary/20 font-black uppercase tracking-widest italic">{booking.type}</span>
                  </div>
                </div>
                <div className="flex flex-col border-t border-primary/10 pt-4">
                  <span className="text-[10px] text-primary/60 font-black uppercase tracking-widest italic">Requested Date</span>
                  <span className="text-sm text-primary font-bold flex items-center justify-end md:justify-start gap-2 italic">
                    <Calendar className="w-3.5 h-3.5 text-primary" /> {booking.booking_date}
                  </span>
                </div>

                {booking.duration_value && booking.duration_unit && (
                  <div className="flex flex-col border-t border-primary/10 pt-4">
                    <span className="text-[10px] text-primary/60 font-black uppercase tracking-widest italic">Duration</span>
                    <span className="text-sm text-primary font-bold flex items-center justify-end md:justify-start gap-2 italic">
                      <Clock className="w-3.5 h-3.5 text-secondary" /> {booking.duration_value} {booking.duration_unit}
                    </span>
                  </div>
                )}

                <div className="flex flex-col border-t border-primary/10 pt-4">
                  <span className="text-[10px] text-primary/60 font-black uppercase tracking-widest italic">
                    {isCustomBooking ? "Student's Preferred Time" : "Requested Time Slot(s)"}
                  </span>
                  {booking.type === "regular" ? (
                    <div className="space-y-2 mt-2 flex flex-col items-end md:items-start">
                      {(booking.schedules && booking.schedules.length > 0
                        ? booking.schedules
                        : [booking.schedule]
                      ).filter(Boolean).map((s: any, i: number) => (
                        <span key={i} className="text-xs text-primary font-bold flex items-center gap-2 bg-white/60 px-4 py-2 rounded-lg border border-primary/10 w-fit italic shadow-sm">
                          <Clock className="w-3.5 h-3.5 text-secondary" />
                          {to12h(s.start_time)} - {to12h(s.end_time)}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-secondary font-black flex items-center justify-end md:justify-start gap-2 italic underline decoration-secondary/30 mt-1 pl-1">
                      <Clock className="w-3.5 h-3.5" />
                      {to12h(booking.custom_start_time)} – {to12h(booking.custom_end_time)}
                    </span>
                  )}
                  {booking.instructor && (
                    <span className="text-[10px] text-primary/60 font-black uppercase tracking-widest italic mt-3 block">
                      Assigned Facilitator: <span className="text-primary">{booking.instructor.name}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-[11px] font-black text-primary/60 uppercase tracking-widest mb-4 italic">Current Status</h4>
              <div className={`text-center px-4 py-3 rounded-xl border-2 shadow-sm font-black uppercase tracking-widest text-xs italic ${statusColors[booking.status]}`}>
                {booking.status}
              </div>
            </div>
          </div>
        </div>

        {/* ── Instructor Assignment Section ───────────────────────────── */}
        {booking.status === "pending" && (
          <div className="mt-8 pt-8 border-t border-primary/20">
            <h4 className="text-[11px] font-black text-primary/60 uppercase tracking-widest mb-4 flex items-center gap-2 italic">
              <User className="w-3.5 h-3.5 text-primary" /> Assign Instructor
            </h4>
            <div className="bg-white/40 rounded-xl p-6 border border-primary/20 space-y-6 shadow-sm">

              {booking.type === "regular" ? (
                /* Regular bookings: Show specific fixed instructors for each assigned slot */
                <div className="space-y-6">
                  {(booking.schedules && booking.schedules.length > 0
                    ? booking.schedules
                    : [booking.schedule]
                  ).filter(Boolean).map((s: any, idx: number) => (
                    <div key={idx} className="space-y-3">
                      <div className="flex items-center gap-2 border-l-2 border-primary/20 pl-3">
                        <Clock className="w-3 h-3 text-secondary" />
                        <span className="text-[9px] text-primary/60 font-black uppercase tracking-widest italic">
                          Class Slot: {to12h(s.start_time)} – {to12h(s.end_time)}
                        </span>
                      </div>
                      
                      {s.instructor ? (
                        <div
                          onClick={() => setSelectedInstructorId(s.instructor.id)}
                          className={`border rounded-xl px-4 py-3 text-sm font-bold italic shadow-sm flex items-center gap-3 cursor-pointer transition-all ${
                            selectedInstructorId === s.instructor.id
                              ? "bg-primary text-white border-primary scale-[1.02]"
                              : "bg-primary/5 text-primary border-primary/20 hover:border-primary/40 text-primary/80"
                          }`}
                        >
                          <User className="w-4 h-4" />
                          <div className="flex-1">
                            <p className="line-clamp-1 text-xs">{s.instructor.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className={`text-[8px] font-medium uppercase tracking-tighter ${selectedInstructorId === s.instructor.id ? "text-white/70" : "text-primary/60"}`}>
                                Fixed Instructor for this Slot
                              </span>
                            </div>
                          </div>
                          {selectedInstructorId === s.instructor.id && <CheckCircle2 className="w-3 h-3" />}
                        </div>
                      ) : (
                        <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl px-4 py-3 flex items-center gap-3">
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                          <span className="text-[10px] text-amber-600/70 font-bold italic">
                            No fixed lead instructor assigned to this program slot.
                          </span>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Fallback: if slots don't have fixed instructors, show program-linked facilitators */}
                  {(() => {
                    const hasSomeNoFixed = (booking.schedules && booking.schedules.length > 0
                      ? booking.schedules
                      : [booking.schedule]
                    ).filter(Boolean).some((s: any) => !s.instructor);

                    if (hasSomeNoFixed && availableInstructors.length > 0) {
                      return (
                        <div className="pt-4 border-t border-primary/10">
                          <span className="text-[10px] text-primary/60 font-black uppercase tracking-widest italic block mb-3">
                            Available Program Facilitators
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {availableInstructors.map((ins) => (
                              <div
                                key={ins.id}
                                onClick={() => setSelectedInstructorId(ins.id)}
                                className={`border rounded-xl px-4 py-3 text-sm font-bold italic shadow-sm flex items-center gap-3 cursor-pointer transition-all ${
                                  selectedInstructorId === ins.id
                                    ? "bg-primary text-white border-primary scale-[1.02]"
                                    : "bg-primary/5 text-primary border-primary/20 hover:border-primary/40 text-primary/80"
                                }`}
                              >
                                <User className="w-4 h-4" />
                                <span className="line-clamp-1 text-xs">{ins.name}</span>
                                {selectedInstructorId === ins.id && <CheckCircle2 className="ml-auto w-3 h-3" />}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {loadingInstructors && (
                    <span className="text-[10px] text-primary/60 animate-pulse font-bold italic block mt-4 text-center">
                      Refreshing instructor list...
                    </span>
                  )}
                </div>
              ) : (
                /* Customization bookings: Show dynamic availability sections */
                <div className="space-y-5">
                  {/* Available instructors */}
                  {availableInstructors.filter(ins => ins.is_available).length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[9px] text-green-600 font-bold uppercase tracking-widest">Perfectly Available</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {availableInstructors.filter(ins => ins.is_available).map((ins) => (
                          <div
                            key={ins.id}
                            onClick={() => setSelectedInstructorId(ins.id)}
                            className={`border rounded-xl px-4 py-3 text-sm font-bold italic shadow-sm flex items-center gap-3 cursor-pointer transition-all ${
                              selectedInstructorId === ins.id
                                ? "bg-primary text-white border-primary scale-[1.02]"
                                : "bg-green-500/5 text-primary border-green-500/10 hover:border-green-500/40 hover:bg-green-500/10"
                            }`}
                          >
                            <User className={`w-4 h-4 ${selectedInstructorId === ins.id ? "text-white" : "text-green-600"}`} />
                            <div className="flex-1">
                              <p className="line-clamp-1">{ins.name}</p>
                              <p className={`text-[9px] font-medium uppercase ${selectedInstructorId === ins.id ? "text-white/70" : "text-green-600/60"}`}>
                                Free for requested time
                              </p>
                            </div>
                            {selectedInstructorId === ins.id && <CheckCircle2 className="w-3 h-3" />}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Busy but has free slots */}
                  {availableInstructors.filter(ins => !ins.is_available && ins.free_slots?.length > 0).length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                        <span className="text-[9px] text-amber-600 font-bold uppercase tracking-widest">Busy but has free time</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {availableInstructors.filter(ins => !ins.is_available && ins.free_slots?.length > 0).map((ins) => (
                          <div
                            key={ins.id}
                            onClick={() => setSelectedInstructorId(ins.id)}
                            className={`border rounded-xl px-4 py-3 text-sm font-bold italic shadow-sm flex items-center gap-3 cursor-pointer transition-all ${
                              selectedInstructorId === ins.id
                                ? "bg-primary text-white border-primary scale-[1.02]"
                                : "bg-amber-500/5 text-primary border-amber-500/10 hover:border-amber-500/40 hover:bg-amber-500/10"
                            }`}
                          >
                            <Clock className={`w-4 h-4 ${selectedInstructorId === ins.id ? "text-white" : "text-amber-600"}`} />
                            <div className="flex-1">
                              <p className="line-clamp-1">{ins.name}</p>
                              <div className={`flex flex-wrap gap-1 mt-0.5 ${selectedInstructorId === ins.id ? "text-white/70" : "text-amber-600/70"}`}>
                                <span className="text-[8px] font-medium uppercase">Free:</span>
                                {ins.free_slots.slice(0, 2).map((s: any, i: number) => (
                                  <span key={i} className="text-[8px] bg-black/5 px-1 rounded">{to12h(s.start)}</span>
                                ))}
                                {ins.free_slots.length > 2 && <span className="text-[8px]">…</span>}
                              </div>
                            </div>
                            {selectedInstructorId === ins.id && <CheckCircle2 className="w-3 h-3" />}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {loadingInstructors && (
                    <span className="text-[10px] text-primary/60 animate-pulse font-bold italic">Checking availability...</span>
                  )}
                  {!loadingInstructors && availableInstructors.length === 0 && (
                    <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest italic">
                      No instructors assigned to this program.
                    </span>
                  )}
                </div>
              )}

              {/* ── Selected instructor's busy time warning (customization only) ── */}
              {isCustomBooking && selectedInstructorId && (selectedInstructor?.booked_slots?.length > 0 || freeSlots.length > 0) && (
                <div className="space-y-4 pt-4 border-t border-primary/10">
                  {/* Booked / busy slots */}
                  {selectedInstructor?.booked_slots?.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[9px] font-black text-amber-600/60 uppercase tracking-widest">
                        {selectedInstructor?.name}'s Booked / Busy Windows
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedInstructor.booked_slots.map((seg: any, i: number) => (
                          <span
                            key={i}
                            className="text-[11px] bg-amber-50 border border-amber-200 text-amber-700 font-bold px-3 py-1.5 rounded-lg"
                          >
                            {to12h(seg.start)} – {to12h(seg.end)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Free slots */}
                  {freeSlots.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[9px] font-black text-green-600/60 uppercase tracking-widest">
                        {selectedInstructor?.name}'s Remaining Free Windows
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {freeSlots.map((seg: any, i: number) => (
                          <span
                            key={i}
                            className="text-[11px] bg-green-50 border border-green-200 text-green-700 font-bold px-3 py-1.5 rounded-lg"
                          >
                            {to12h(seg.start)} – {to12h(seg.end)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Overlap warning */}
                  {timeConflict && (
                    <div className="flex items-start gap-3 bg-red-500/10 border-2 border-red-500/20 rounded-2xl px-5 py-4 text-xs text-red-700 shadow-lg shadow-red-500/5 animate-pulse">
                      <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
                      <div className="space-y-1">
                        <strong className="text-sm font-black uppercase tracking-tighter block mb-1">⚠️ Scheduling Conflict Detected</strong>
                        <p className="font-medium leading-normal">
                          The agreed time <strong>{to12h(agreedStart)} – {to12h(agreedEnd)}</strong> overlaps with another booking or is outside the instructor's free segments.
                        </p>
                        <p className="text-[10px] font-black uppercase tracking-widest mt-2 bg-red-500 text-white w-fit px-2 py-0.5 rounded italic">
                          Override Allowed: You can still approve this booking despite the conflict.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── Editable agreed time (customization only) ── */}
              {isCustomBooking && (
                <div className="pt-4 border-t border-primary/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest italic">
                      Agreed Class Time
                    </p>
                    <button
                      type="button"
                      onClick={() => setEditingTime((v) => !v)}
                      className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-primary/50 hover:text-primary transition"
                    >
                      <Edit3 className="w-3 h-3" />
                      {editingTime ? "Done editing" : "Edit time"}
                    </button>
                  </div>

                  {editingTime ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[9px] text-primary/50 font-black uppercase tracking-widest mb-1">From</p>
                        <input
                          type="time"
                          value={agreedStart}
                          onChange={(e) => setAgreedStart(e.target.value)}
                          className="w-full bg-white/60 border border-primary/20 rounded-xl px-4 py-3 text-sm text-primary font-bold focus:outline-none focus:border-primary transition"
                        />
                      </div>
                      <div>
                        <p className="text-[9px] text-primary/50 font-black uppercase tracking-widest mb-1">To</p>
                        <input
                          type="time"
                          value={agreedEnd}
                          onChange={(e) => setAgreedEnd(e.target.value)}
                          className="w-full bg-white/60 border border-primary/20 rounded-xl px-4 py-3 text-sm text-primary font-bold focus:outline-none focus:border-primary transition"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border font-black text-sm italic ${
                      timeConflict
                        ? "bg-amber-50 border-amber-200 text-amber-700"
                        : "bg-white/60 border-primary/20 text-primary"
                    }`}>
                      <Clock className="w-4 h-4" />
                      {agreedStart && agreedEnd
                        ? `${to12h(agreedStart)} – ${to12h(agreedEnd)}`
                        : <span className="text-primary/30 font-normal italic text-xs">No agreed time set — will use student's preferred time</span>
                      }
                    </div>
                  )}

                  {agreedStart && agreedEnd && agreedEnd <= agreedStart && (
                    <p className="text-[10px] text-red-500 font-bold italic">End time must be after start time.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-primary/20 mt-8">
          <button
            onClick={handleApprove}
            disabled={Boolean(
              booking.status === "accepted" ||
              (booking.status === "pending" && !selectedInstructorId) ||
              (isCustomBooking && agreedStart && agreedEnd && agreedEnd <= agreedStart)
            )}
            className={`flex-1 px-6 py-3.5 rounded-xl transition duration-300 font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 italic shadow-md active:scale-95 ${
              booking.status === "accepted"
                ? "bg-green-500/20 text-green-600 border border-green-500/30 cursor-not-allowed shadow-none"
                : booking.status === "pending" && !selectedInstructorId
                  ? "bg-white/40 text-primary/30 border border-primary/10 cursor-not-allowed shadow-none"
                  : "bg-green-500/10 text-green-600 border border-green-500/20 hover:bg-green-500 hover:text-white shadow-green-500/10 cursor-pointer"
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            {booking.status === "accepted" ? "Booking Approved" : "Approve Booking"}
          </button>
          <button
            onClick={() => onStatusUpdate("rejected")}
            className="flex-1 px-6 py-3.5 bg-red-500/10 text-red-600 border border-red-500/20 rounded-xl hover:bg-red-500 hover:text-white transition duration-300 font-black uppercase tracking-widest text-[10px] flex items-center cursor-pointer justify-center gap-2 italic shadow-md shadow-red-500/10 active:scale-95"
          >
            <XCircle className="w-4 h-4" /> Reject Request
          </button>
          <button
            onClick={onClose}
            className="px-8 py-3.5 bg-white/40 cursor-pointer text-primary/60 border border-primary/10 rounded-xl hover:bg-white/60 hover:text-primary transition duration-300 font-black uppercase tracking-widest text-[10px] italic shadow-sm active:scale-95"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingViewModal;