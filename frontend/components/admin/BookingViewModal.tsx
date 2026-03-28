"use client";

import React from "react";
import { X, User, Phone, Mail, Calendar, Clock, MapPin, Tag, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { to12h } from "@/lib/timeFormat";

interface BookingViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: any;
  onStatusUpdate: (status: string, instructorId?: number) => void;
}

const statusColors: any = {
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  accepted: "bg-green-500/10 text-green-500 border-green-500/20",
  rejected: "bg-red-500/10 text-red-500 border-red-500/20",
};

const BookingViewModal: React.FC<BookingViewModalProps> = ({
  isOpen,
  onClose,
  booking,
  onStatusUpdate
}) => {
  const [availableInstructors, setAvailableInstructors] = React.useState<any[]>([]);
  const [loadingInstructors, setLoadingInstructors] = React.useState(false);
  const [selectedInstructorId, setSelectedInstructorId] = React.useState<number | "">("");

  React.useEffect(() => {
    if (isOpen && booking?.id) {
      fetchAvailableInstructors(booking.id);
      
      const preAssignedId = booking.schedule?.instructor_id || booking.schedules?.find((s: any) => s.instructor_id)?.instructor_id;
      setSelectedInstructorId(booking.instructor_id || (booking.type === 'regular' ? preAssignedId : "") || "");
    } else {
      setAvailableInstructors([]);
      setSelectedInstructorId("");
    }
  }, [isOpen, booking?.id, booking?.instructor_id, booking?.type, booking?.schedule, booking?.schedules]);

  const fetchAvailableInstructors = async (bookingId: number) => {
    try {
      setLoadingInstructors(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/bookings/${bookingId}/available-instructors`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const result = await res.json();
      if (res.ok) {
        setAvailableInstructors(result.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch instructors", error);
    } finally {
      setLoadingInstructors(false);
    }
  };

  if (!isOpen || !booking) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-lg cursor-pointer"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto hide-scrollbar rounded-2xl p-8 bg-white/50 relative cursor-default"
        style={{
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <div className="flex justify-between items-center mb-8 border-b border-primary/50 pb-4">
          <div className="space-y-1">
             <h2 className="text-xl font-bold text-primary flex items-center gap-2 italic">
                <AlertCircle className="w-5 h-5 text-primary" /> Booking Request Details
             </h2>
             <p className="text-[10px] text-primary/60 uppercase tracking-widest font-black italic">Ref ID: BK-{booking.id?.toString().padStart(4, '0')}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-primary/60 hover:text-primary transition">
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
                   <div className="flex flex-col">
                      <span className="text-[10px] text-primary/60 font-black uppercase tracking-widest italic">Full Name</span>
                      <span className="text-sm text-primary font-bold">{booking.name}</span>
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[10px] text-primary/60 font-black uppercase tracking-widest italic">Contact Email</span>
                      <span className="text-sm text-primary font-bold flex items-center gap-2 italic">
                        <Mail className="w-3.5 h-3.5 text-primary" /> {booking.email}
                      </span>
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[10px] text-primary/60 font-black uppercase tracking-widest italic">Phone Number</span>
                      <span className="text-sm text-primary font-bold flex items-center gap-2 italic">
                        <Phone className="w-3.5 h-3.5 text-secondary" /> {booking.phone}
                      </span>
                   </div>
                </div>
              </div>

              <div>
                <h4 className="text-[11px] font-black text-primary/60 uppercase tracking-widest mb-4 italic">Request Message</h4>
                <p className="text-sm text-primary/80 bg-white/40 p-5 rounded-xl border border-primary/20 italic font-medium leading-relaxed shadow-sm">
                  "{booking.message || 'No additional message provided.'}"
                </p>
              </div>
           </div>

           {/* Section 2: Program & Slot Info */}
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
                      <span className="text-[10px] text-primary/60 font-black uppercase tracking-widest italic">Requested Time Slot(s)</span>
                      {booking.type === 'regular' ? (
                        <div className="space-y-2 mt-2 flex flex-col items-end md:items-start">
                          {(booking.schedules && booking.schedules.length > 0 ? booking.schedules : [booking.schedule]).filter(Boolean).map((s: any, i: number) => (
                            <span key={i} className="text-xs text-primary font-bold flex items-center gap-2 bg-white/60 px-4 py-2 rounded-lg border border-primary/10 w-fit italic shadow-sm hover:border-primary/40 transition">
                              <Clock className="w-3.5 h-3.5 text-secondary" /> 
                              {to12h(s.start_time)} - {to12h(s.end_time)}
                            </span>
                          ))}
                          {(!booking.schedules || booking.schedules.length === 0) && !booking.schedule && (
                             <span className="text-xs text-red-500 font-bold italic">No slots selected</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-secondary font-black flex items-center justify-end md:justify-start gap-2 italic underline decoration-secondary/30 mt-1 pl-1">
                          <Clock className="w-3.5 h-3.5" /> {to12h(booking.custom_start_time)} - {to12h(booking.custom_end_time)}
                        </span>
                      )}
                      {booking.instructor && (
                         <span className="text-[10px] text-primary/60 font-black uppercase tracking-widest italic mt-3 block">Assigned Facilitator: <span className="text-primary">{booking.instructor.name}</span></span>
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

        {/* Instructor Assignment Section */}
        {booking.status === 'pending' && (
          <div className="mt-8 pt-8 border-t border-primary/20">
            <h4 className="text-[11px] font-black text-primary/60 uppercase tracking-widest mb-4 flex items-center gap-2 italic">
              <User className="w-3.5 h-3.5 text-primary" /> Assign Instructor
            </h4>
            <div className="bg-white/40 rounded-xl p-6 border border-primary/20 space-y-4 shadow-sm">
              {booking.type === 'regular' && (booking.schedule?.instructor || (booking.schedules && booking.schedules.some((s: any) => s.instructor))) ? (
                // For regular bookings with pre-assigned instructor
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] text-primary/60 font-black uppercase tracking-widest italic">Pre-assigned Teacher(s)</span>
                  {(() => {
                    // Extract unique instructors across all schedules
                    const uniqueInstructors: any[] = [];
                    const foundIds = new Set();

                    const addToUnique = (ins: any) => {
                      if (ins && !foundIds.has(ins.id)) {
                        uniqueInstructors.push(ins);
                        foundIds.add(ins.id);
                      }
                    };

                    if (booking.schedule?.instructor) addToUnique(booking.schedule.instructor);
                    if (booking.schedules) {
                       booking.schedules.forEach((s: any) => addToUnique(s.instructor));
                    }

                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {uniqueInstructors.map((instructor) => (
                          <div 
                            key={instructor.id}
                            onClick={() => setSelectedInstructorId(instructor.id)}
                            className={`border rounded-xl px-4 py-3 text-sm font-bold italic shadow-sm flex items-center gap-3 cursor-pointer transition-all ${
                              selectedInstructorId === instructor.id 
                                ? "bg-primary text-white border-primary shadow-primary/20 scale-[1.02]" 
                                : "bg-primary/5 text-primary border-primary/20 hover:border-primary/40 hover:bg-primary/10"
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-colors ${
                              selectedInstructorId === instructor.id ? "bg-primary/20 border-primary/40 text-primary" : "bg-primary/5 border-primary/10 text-primary/40"
                            }`}>
                              <User className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                              <p className="line-clamp-1">{instructor.name}</p>
                              <p className={`text-[9px] font-medium uppercase tracking-tighter ${
                                selectedInstructorId === instructor.id ? "text-primary/70" : "text-primary/30"
                              }`}>Assigned to class schedule</p>
                            </div>
                            {selectedInstructorId === instructor.id && (
                              <div className="bg-white rounded-full p-1 text-primary">
                                <CheckCircle2 className="w-3 h-3" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              ) : (
                // For customization or if no teacher is pre-assigned
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] text-primary/60 font-black uppercase tracking-widest italic">Available Teachers for this Slot</span>
                  <select 
                    value={selectedInstructorId}
                    onChange={(e) => setSelectedInstructorId(e.target.value ? Number(e.target.value) : "")}
                    className="bg-white/60 border border-primary/20 rounded-xl px-4 py-3 text-sm text-primary font-bold italic focus:outline-none focus:border-primary transition w-full appearance-none cursor-pointer hover:border-primary/40"
                    disabled={loadingInstructors}
                  >
                    <option value="">-- Choose a teacher --</option>
                    {availableInstructors.map((ins) => {
                      let statusText = "";
                      if (ins.is_available) {
                        statusText = "Perfectly Available";
                      } else if (ins.free_slots && ins.free_slots.length > 0) {
                        const slots = ins.free_slots.map((s: any) => `${to12h(s.start)} - ${to12h(s.end)}`).join(", ");
                        statusText = `Busy. Free: ${slots}`;
                      } else {
                        statusText = "No free time defined today";
                      }
                      return (
                        <option key={ins.id} value={ins.id}>
                          {ins.name} ({statusText})
                        </option>
                      );
                    })}
                  </select>
                  {loadingInstructors && <span className="text-[10px] text-primary/60 animate-pulse font-bold italic">Checking availability...</span>}
                  {!loadingInstructors && availableInstructors.length === 0 && (
                    <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest italic">No instructors assigned to this program.</span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-primary/20 mt-8">
           <button 
             onClick={() => onStatusUpdate('accepted', selectedInstructorId ? Number(selectedInstructorId) : undefined)}
             disabled={booking.status === 'pending' && !selectedInstructorId}
             className={`flex-1 px-6 py-3.5 rounded-xl transition duration-300 font-black uppercase tracking-widest text-[10px] flex items-center cursor-pointer justify-center gap-2 italic shadow-md active:scale-95 ${
               booking.status === 'pending' && !selectedInstructorId 
               ? 'bg-white/40 text-primary/30 border border-primary/10 cursor-not-allowed shadow-none' 
               : 'bg-green-500/10 text-green-600 border border-green-500/20 hover:bg-green-500 hover:text-white shadow-green-500/10'
             }`}
           >
             <CheckCircle2 className="w-4 h-4 " /> Approve Booking
           </button>
           <button 
             onClick={() => onStatusUpdate('rejected')}
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
