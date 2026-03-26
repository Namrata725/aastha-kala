"use client";

import React, { useEffect, useState } from "react";
import { Clock, Calendar, User, Search, MapPin, Monitor } from "lucide-react";
import toast from "react-hot-toast";
import { to12h } from "@/lib/timeFormat";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const InstructorSchedulePage = () => {
    const [instructorsSchedules, setInstructorsSchedules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchSchedules = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/instructors-schedules`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.message || "Failed to fetch schedules");
            setInstructorsSchedules(result.data || []);
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchedules();
    }, []);

    const filteredSchedules = instructorsSchedules.filter((item: any) => 
        item.instructor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.classes.some((c: any) => c.program_title.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center p-6 bg-white/5 border border-white/10 rounded-2xl gap-6 backdrop-blur-md">
                <div className="flex flex-col text-center md:text-left">
                    <span className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-primary to-secondary italic">Master Timetable</span>
                    <span className="text-[10px] text-white/40 font-black uppercase tracking-widest mt-0.5">Track teaching sessions across all instructors</span>
                </div>

                <div className="relative w-full md:w-80">
                   <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                   <input 
                     type="text" 
                     placeholder="Search instructors or programs..." 
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="w-full bg-black/40 border border-white/10 rounded-xl px-10 py-2.5 text-sm text-white focus:outline-none focus:border-primary transition"
                   />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : filteredSchedules.length === 0 ? (
                    <div className="text-center py-20 bg-white/5 border border-white/10 rounded-2xl">
                        <Calendar className="w-12 h-12 text-white/10 mx-auto mb-4" />
                        <p className="text-white/40 font-bold uppercase tracking-widest text-xs">No schedules found</p>
                    </div>
                ) : (
                    filteredSchedules.map((item: any) => (
                        <div key={item.instructor.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden group hover:border-white/20 transition duration-500">
                             <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        {item.instructor.image ? (
                                            <img src={item.instructor.image} className="w-12 h-12 rounded-xl object-cover" />
                                        ) : (
                                            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold">
                                                {item.instructor.name.charAt(0)}
                                            </div>
                                        )}
                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-[#1a1a1a] rounded-full" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-white tracking-tight">{item.instructor.name}</span>
                                        <span className="text-[10px] text-white/40 uppercase font-bold tracking-tighter">{item.instructor.title}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6 pr-4">
                                    <div className="flex flex-col items-end">
                                        <span className="text-lg font-black text-secondary">{item.classes.length}</span>
                                        <span className="text-[9px] text-white/30 uppercase font-black">Active Classes</span>
                                    </div>
                                </div>
                             </div>

                             <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                                    {days.map(day => {
                                        const dayClasses = item.classes.filter((c: any) => c.day_of_week === day);
                                        const dayAvailabilities = item.availabilities.filter((a: any) => a.day_of_week === day && a.is_available);

                                        return (
                                            <div key={day} className={`flex flex-col gap-3 p-3 rounded-xl border ${dayClasses.length > 0 ? 'bg-primary/5 border-primary/20' : dayAvailabilities.length > 0 ? 'bg-white/[0.02] border-white/5' : 'bg-red-500/5 border-red-500/10'}`}>
                                                <span className={`text-[10px] uppercase font-black tracking-widest text-center pb-2 border-b ${dayClasses.length > 0 ? 'text-primary border-primary/10' : 'text-white/20 border-white/5'}`}>
                                                    {day.substring(0, 3)}
                                                </span>
                                                
                                                <div className="space-y-2 min-h-[60px]">
                                                    {/* Teaching Slots */}
                                                    {dayClasses.map((c: any, i: number) => (
                                                        <div key={i} className="flex flex-col p-2 bg-secondary/10 rounded-lg border border-secondary/20 group/card transition">
                                                            <span className="text-[9px] font-black text-secondary truncate uppercase">{c.program_title}</span>
                                                            <span className="text-[8px] text-white/60 flex items-center gap-1 mt-1 font-bold">
                                                                <Clock className="w-2.5 h-2.5" /> {to12h(c.start_time)} - {to12h(c.end_time)}
                                                            </span>
                                                        </div>
                                                    ))}

                                                    {/* Free / Available Slots */}
                                                    {dayAvailabilities.map((a: any, i: number) => {
                                                        // Simple check if this availability slot is already fully occupied by classes (not perfect but helpful)
                                                        return (
                                                            <div key={i} className="flex flex-col p-2 bg-white/5 rounded-lg border border-white/5 opacity-40 hover:opacity-100 transition">
                                                                <span className="text-[8px] font-black text-white/40 uppercase tracking-tighter">Availability</span>
                                                                <span className="text-[8px] text-white/60 flex items-center gap-1 mt-0.5 font-bold">
                                                                    {to12h(a.start_time)} - {to12h(a.end_time)}
                                                                </span>
                                                            </div>
                                                        );
                                                    })}

                                                    {dayClasses.length === 0 && dayAvailabilities.length === 0 && (
                                                        <div className="flex items-center justify-center pt-4 opacity-10">
                                                            <span className="text-[8px] font-black uppercase text-red-500">Off Day</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                             </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default InstructorSchedulePage;
