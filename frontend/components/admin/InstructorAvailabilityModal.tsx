"use client";

import React, { useEffect, useState } from "react";
import { X, Plus, Trash2, Clock, Calendar } from "lucide-react";
import toast from "react-hot-toast";
import { to12h } from "@/lib/timeFormat";

interface InstructorAvailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  instructor: any;
}

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const InstructorAvailabilityModal: React.FC<InstructorAvailabilityModalProps> = ({
  isOpen,
  onClose,
  instructor,
}) => {
  const [loading, setLoading] = useState(false);
  const [availabilities, setAvailabilities] = useState<any[]>([]);

  const fetchAvailabilities = async () => {
    if (!instructor) return;
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/instructor-availabilities/instructor/${instructor.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      setAvailabilities(data.data || []);
    } catch (error) { toast.error("Failed to load availabilities"); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (isOpen) fetchAvailabilities(); }, [isOpen, instructor]);

  const addSlot = async () => {
    const newSlot = { 
        instructor_id: instructor.id, 
        day_of_week: "Monday", 
        start_time: "09:00", 
        end_time: "10:00" 
    };
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/instructor-availabilities`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}` 
        },
        body: JSON.stringify(newSlot),
      });
      if (res.ok) { fetchAvailabilities(); toast.success("Slot added"); }
    } catch (error) { toast.error("Failed to add slot"); }
  };

  const deleteSlot = async (id: number) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/instructor-availabilities/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.ok) { fetchAvailabilities(); toast.success("Slot removed"); }
    } catch (error) { toast.error("Failed to delete slot"); }
  };

  const updateSlot = async (id: number, field: string, value: any) => {
    try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/instructor-availabilities/${id}`, {
            method: "PUT",
            headers: { 
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}` 
            },
            body: JSON.stringify({ [field]: value }),
        });
        fetchAvailabilities();
    } catch (error) { toast.error("Sync failed"); }
  };

  if (!isOpen || !instructor) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer" onClick={onClose} />
      <div className="relative bg-[#1a1a1a] border border-white/10 rounded-3xl w-full max-w-3xl max-h-[85vh] overflow-y-auto p-8 shadow-3xl">
        <div className="flex justify-between items-center mb-10 border-b border-white/5 pb-6">
          <div className="space-y-1">
             <h2 className="text-xl font-bold text-white flex items-center gap-3 italic">
                <Calendar className="w-5 h-5 text-secondary" /> {instructor.name}'s Free Hours
             </h2>
             <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Define slots for private class bookings</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white/60 hover:text-white transition group">
            <X className="w-5 h-5 group-hover:rotate-90 transition duration-300" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {availabilities.map((s, index) => (
              <div key={index} className="flex flex-row items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 shadow-inner group hover:border-primary/40 transition">
                  <div className="flex-1 space-y-3">
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <span className="text-[9px] text-white/30 font-bold uppercase ml-1">Start Time</span>
                          <input 
                            type="time" 
                            value={s.start_time?.substring(0, 5)}
                            onChange={(e) => updateSlot(s.id, 'start_time', e.target.value)}
                            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-secondary font-bold focus:outline-none focus:border-secondary/50 transition"
                          />
                          <p className="text-[9px] text-white/20 font-medium italic ml-1">{to12h(s.start_time)}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[9px] text-white/30 font-bold uppercase ml-1">End Time</span>
                          <input 
                            type="time" 
                            value={s.end_time?.substring(0, 5)}
                            onChange={(e) => updateSlot(s.id, 'end_time', e.target.value)}
                            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-secondary font-bold focus:outline-none focus:border-secondary/50 transition"
                          />
                          <p className="text-[9px] text-white/20 font-medium italic ml-1">{to12h(s.end_time)}</p>
                        </div>
                      </div>
                   </div>
                  <button 
                    onClick={() => deleteSlot(s.id)}
                    className="p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition shadow-lg group-hover:scale-110"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
              </div>
            ))}
            {!availabilities.length && !loading && (
                <div className="text-center py-10 border-2 border-dashed border-white/10 rounded-3xl">
                   <p className="text-sm text-white/30 italic">No free slots defined yet. Add hours to allow private bookings.</p>
                </div>
            )}
            {loading && <div className="text-center py-10 animate-pulse text-xs text-white/20 uppercase font-black uppercase tracking-widest italic">Syncing with server...</div>}
          </div>

          <button 
            type="button" 
            disabled={loading}
            onClick={addSlot}
            className="w-full py-4 border-2 border-dashed border-primary/20 text-primary rounded-2xl hover:border-primary/60 hover:bg-primary/5 transition flex items-center justify-center gap-3 text-sm font-bold uppercase tracking-widest shadow-2xl active:scale-95"
          >
            <Plus className="w-5 h-5" /> Add Availability Slot
          </button>
        </div>

        <div className="flex justify-end pt-8 mt-10 border-t border-white/5">
             <button onClick={onClose} className="px-10 py-3 bg-white/5 text-white/40 rounded-xl hover:bg-white/10 hover:text-white transition duration-300 font-bold uppercase tracking-widest text-[10px]">Close Settings</button>
        </div>
      </div>
    </div>
  );
};

export default InstructorAvailabilityModal;
