"use client";

import React, { useEffect, useState } from "react";
import { Calendar, Search } from "lucide-react";
import Table from "@/components/layout/Table";
import toast from "react-hot-toast";
import { Pagination } from "@/components/global/Pagination";
import { to12h } from "@/lib/timeFormat";


const InstructorSchedulePage = () => {
    const [instructorsSchedules, setInstructorsSchedules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [expandedInstructor, setExpandedInstructor] = useState<number | null>(null);
    
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10,
    });

    const fetchSchedules = async (page: number = 1) => {
        try {
            setLoading(true);
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/instructors-schedules?page=${page}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.message || "Failed to fetch schedules");
            
            const list = result.data?.data || result.data || [];
            setInstructorsSchedules(list);
            
            if (result.data?.last_page) {
                setPagination({
                    currentPage: result.data.current_page,
                    totalPages: result.data.last_page,
                    totalItems: result.data.total,
                    itemsPerPage: result.data.per_page,
                });
            }
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
            <div className="flex flex-col md:flex-row justify-between items-center p-6 bg-white border border-gray-200 rounded-2xl gap-6 shadow-sm">
                <div className="flex flex-col text-center md:text-left">
                    <span className="text-2xl font-black text-gray-900 tracking-tight uppercase italic">Master Timetable</span>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Track teaching sessions across all instructors</span>
                </div>

                <div className="relative w-full md:w-80">
                   <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                   <input 
                     type="text" 
                     placeholder="Search instructors or programs..." 
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="w-full bg-gray-50 border border-gray-200 rounded-xl px-10 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-primary transition shadow-sm"
                   />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : filteredSchedules.length === 0 ? (
                    <div className="text-center py-20 bg-white border border-gray-200 rounded-2xl">
                        <Calendar className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No schedules found</p>
                    </div>
                ) : (
                    filteredSchedules.map((item: any) => {
                        const isExpanded = expandedInstructor === item.instructor.id;
                        
                        const columns = [
                            { key: "sn", label: "SN" },
                            { key: "time", label: "Time" },
                            { key: "details", label: "Program / Details" },
                            { key: "status", label: "Status" },
                        ];
                        
                        // Helper: check if two time ranges overlap
                        const timesOverlap = (aStart: string, aEnd: string, bStart: string, bEnd: string) => {
                            return aStart < bEnd && aEnd > bStart;
                        };

                        const combinedSchedules = [
                            ...item.classes.map((c: any, idx: number) => ({
                                id: `class-${idx}`,
                                time: `${to12h(c.start_time)} - ${to12h(c.end_time)}`,
                                details: c.program_title,
                                status: <span className="px-2 py-0.5 bg-[#f59e0b]/20 text-primary border border-[#f59e0b]/30 rounded text-xs font-bold uppercase tracking-widest">Occupied</span>,
                                _sortTime: c.start_time,
                            })),
                            ...item.availabilities.map((a: any, idx: number) => {
                                // Check if this availability slot overlaps with any scheduled class
                                const isOccupied = item.classes.some((c: any) =>
                                    timesOverlap(
                                        a.start_time.substring(0, 5),
                                        a.end_time.substring(0, 5),
                                        c.start_time.substring(0, 5),
                                        c.end_time.substring(0, 5)
                                    )
                                );

                                return {
                                    id: `avail-${idx}`,
                                    time: `${to12h(a.start_time)} - ${to12h(a.end_time)}`,
                                    details: isOccupied
                                        ? item.classes.find((c: any) =>
                                            timesOverlap(
                                                a.start_time.substring(0, 5),
                                                a.end_time.substring(0, 5),
                                                c.start_time.substring(0, 5),
                                                c.end_time.substring(0, 5)
                                            )
                                          )?.program_title ?? "Occupied"
                                        : "Free slot for booking",
                                    status: isOccupied
                                        ? <span className="px-2 py-0.5 bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/30 rounded text-xs font-bold uppercase tracking-widest">Occupied</span>
                                        : <span className="px-2 py-0.5 bg-green-500/20 text-green-500 border border-green-500/30 rounded text-xs font-bold uppercase tracking-widest">Free</span>,
                                    _sortTime: a.start_time,
                                };
                            })
                        ].sort((a, b) => a._sortTime.localeCompare(b._sortTime))
                          .map((s, idx) => ({ ...s, sn: idx + 1 }));

                        return (
                        <div key={item.instructor.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden group hover:border-primary/30 transition-all duration-500 shadow-sm">
                             <div 
                                onClick={() => setExpandedInstructor(isExpanded ? null : item.instructor.id)}
                                className={`p-5 flex items-center justify-between cursor-pointer transition-colors duration-300 ${isExpanded ? 'bg-gray-400/10' : 'bg-gray-50/50 hover:bg-gray-100'}`}
                             >
                                <div className="flex items-center gap-5">
                                    <div className="relative">
                                        <div className={`p-0.5 rounded-xl bg-gradient-to-tr ${isExpanded ? 'from-primary to-secondary' : 'from-white/10 to-white/5'}`}>
                                            {item.instructor.image ? (
                                                <img 
                                                    src={item.instructor.image} 
                                                    className="w-14 h-14 rounded-[10px] object-cover" 
                                                    onError={(e: any) => {
                                                        e.target.src = `https://ui-avatars.com/api/?name=${item.instructor.name}&background=111&color=fff`;
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-14 h-14 rounded-[10px] bg-black/60 flex items-center justify-center text-primary font-black text-xl">
                                                    {item.instructor.name.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-[#09090b] rounded-full shadow-lg" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-base font-black text-primary tracking-tight uppercase">{item.instructor.name}</span>
                                        <span className="text-[10px] text-primary uppercase font-black tracking-widest italic">{item.instructor.title}</span>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-10">
                                    <div className="hidden md:flex flex-col items-center">
                                        <span className="text-2xl font-black bg-clip-text text-transparent bg-linear-to-r from-primary to-secondary">{item.classes.length}</span>
                                        <span className="text-[8px] text-primary uppercase font-black tracking-widest">Ongoing Classes</span>
                                    </div>
                                    <div className={`w-10 h-10 rounded-full border border-white/10 flex items-center justify-center transition-all duration-500 ${isExpanded ? 'bg-primary text-white rotate-180 border-primary' : 'bg-white/5 text-white/40 group-hover:text-white'}`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                    </div>
                                </div>
                             </div>
                             
                             <div className={`transition-all duration-500 ease-in-out border-t border-gray-100 overflow-hidden ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                <div className="p-8 bg-gray-50/30">
                                   <div className="flex items-center gap-4 mb-6">
                                     <div className="h-[1px] flex-1 bg-gray-200" />
                                     <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Instructor Schedule Matrix</span>
                                     <div className="h-[1px] flex-1 bg-gray-200" />
                                   </div>
                                   <Table 
                                       columns={columns} 
                                       data={combinedSchedules} 
                                       emptyMessage="No schedules found for this instructor" 
                                   />
                                </div>
                             </div>
                        </div>
                        );
                    })
                )}

                <div className="mt-6">
                    <Pagination 
                        currentPage={pagination.currentPage}
                        totalPages={pagination.totalPages}
                        totalItems={pagination.totalItems}
                        itemsPerPage={pagination.itemsPerPage}
                        onPageChange={(p) => fetchSchedules(p)}
                    />
                </div>
            </div>
        </div>
    );
};

export default InstructorSchedulePage;
