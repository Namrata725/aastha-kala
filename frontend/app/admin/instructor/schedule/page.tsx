"use client";

import React, { useEffect, useState } from "react";
import { Calendar, Search } from "lucide-react";
import Table from "@/components/layout/Table";
import toast from "react-hot-toast";
import { Pagination } from "@/components/global/Pagination";
import { to12h } from "@/lib/timeFormat";

/** Convert "HH:MM" or "HH:MM:SS" → integer minutes since midnight */
const toMins = (t: string): number => {
  const [h, m] = t.substring(0, 5).split(":").map(Number);
  return h * 60 + m;
};

/** Convert integer minutes → "HH:MM" */
const fromMins = (m: number): string =>
  `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

/**
 * Subtract a booked interval [bStart, bEnd] from a list of free [segStart, segEnd] pairs.
 * All values are in integer minutes. Returns remaining free pairs.
 */
const subtractInterval = (segments: [number, number][], bStart: number, bEnd: number): [number, number][] => {
  const result: [number, number][] = [];
  for (const [segStart, segEnd] of segments) {
    if (bEnd <= segStart || bStart >= segEnd) {
      result.push([segStart, segEnd]); // no overlap
      continue;
    }
    if (segStart < bStart) result.push([segStart, bStart]); // left slice
    if (bEnd < segEnd)     result.push([bEnd, segEnd]);     // right slice
  }
  return result;
};

/**
 * Given an instructor's raw availability ranges and their occupied class intervals,
 * compute and return the remaining free sub-segments.
 */
const computeFreeSegments = (
  availabilities: { start_time: string; end_time: string }[],
  classes: { start_time: string; end_time: string }[]
): { start: string; end: string }[] => {
  // Sort booked intervals by start time
  const booked: [number, number][] = classes
    .map((c) => [toMins(c.start_time), toMins(c.end_time)] as [number, number])
    .sort((a, b) => a[0] - b[0]);

  const freeSegments: { start: string; end: string }[] = [];

  for (const avail of availabilities) {
    const availStart = toMins(avail.start_time);
    const availEnd   = toMins(avail.end_time);
    let segments: [number, number][] = [[availStart, availEnd]];

    for (const [bs, be] of booked) {
      segments = subtractInterval(segments, bs, be);
      if (segments.length === 0) break;
    }

    for (const [segStart, segEnd] of segments) {
      if (segEnd - segStart >= 5) { // ignore tiny slivers < 5 min
        freeSegments.push({ start: fromMins(segStart), end: fromMins(segEnd) });
      }
    }
  }

  return freeSegments;
};

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
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/instructors-schedules?page=${page}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to fetch schedules");

      const list = result.data?.data || result.data || [];
      if (list.length === 0 && page > 1) {
        fetchSchedules(page - 1);
        return;
      }

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

  useEffect(() => { fetchSchedules(); }, []);

  const filteredSchedules = instructorsSchedules.filter((item: any) =>
    item.instructor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.classes.some((c: any) =>
      c.program_title.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center p-6 bg-white border border-gray-200 rounded-2xl gap-6 shadow-sm">
        <div className="flex flex-col text-center md:text-left">
          <span className="text-2xl font-black text-gray-900 tracking-tight uppercase italic">
            Master Timetable
          </span>
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">
            Track teaching sessions &amp; remaining free slots across all instructors
          </span>
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
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">
              No schedules found
            </p>
          </div>
        ) : (
          filteredSchedules.map((item: any) => {
            const isExpanded = expandedInstructor === item.instructor.id;

            const columns = [
              { key: "sn",      label: "SN" },
              { key: "time",    label: "Time" },
              { key: "details", label: "Program / Details" },
              { key: "status",  label: "Status" },
            ];

            // ── Compute free segments via proper interval subtraction ────────────
            const freeSegments = computeFreeSegments(
              item.availabilities || [],
              item.classes || []
            );

            // Build the combined schedule rows
            const classRows = item.classes.map((c: any, idx: number) => ({
              id:          `class-${idx}`,
              sn:          0, // renumbered later
              time:        `${to12h(c.start_time)} – ${to12h(c.end_time)}`,
              details:     c.program_title,
              status:      (
                <span className="px-2 py-0.5 bg-amber-400/20 text-amber-700 border border-amber-400/30 rounded text-xs font-bold uppercase tracking-widest">
                  Occupied
                </span>
              ),
              _sortMins:   toMins(c.start_time),
            }));

            const freeRows = freeSegments.map((seg, idx) => ({
              id:        `free-${idx}`,
              sn:        0,
              time:      `${to12h(seg.start + ":00")} – ${to12h(seg.end + ":00")}`,
              details:   "Free slot — available for booking",
              status:    (
                <span className="px-2 py-0.5 bg-green-500/20 text-green-600 border border-green-500/30 rounded text-xs font-bold uppercase tracking-widest">
                  Free
                </span>
              ),
              _sortMins: toMins(seg.start),
            }));

            const combinedSchedules = [...classRows, ...freeRows]
              .sort((a, b) => a._sortMins - b._sortMins)
              .map((row, idx) => ({ ...row, sn: idx + 1 }));

            return (
              <div
                key={item.instructor.id}
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden group hover:border-primary/30 transition-all duration-500 shadow-sm"
              >
                {/* Instructor header row */}
                <div
                  onClick={() =>
                    setExpandedInstructor(isExpanded ? null : item.instructor.id)
                  }
                  className={`p-5 flex items-center justify-between cursor-pointer transition-colors duration-300 ${
                    isExpanded ? "bg-gray-400/10" : "bg-gray-50/50 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center gap-5">
                    <div className="relative">
                      <div
                        className={`p-0.5 rounded-xl bg-gradient-to-tr ${
                          isExpanded ? "from-primary to-secondary" : "from-white/10 to-white/5"
                        }`}
                      >
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
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full shadow-lg" />
                    </div>

                    <div className="flex flex-col">
                      <span className="text-base font-black text-primary tracking-tight uppercase">
                        {item.instructor.name}
                      </span>
                      <span className="text-[10px] text-primary uppercase font-black tracking-widest italic">
                        {item.instructor.title}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    {/* Occupied count */}
                    <div className="hidden md:flex flex-col items-center">
                      <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                        {item.classes.length}
                      </span>
                      <span className="text-[8px] text-primary uppercase font-black tracking-widest">
                        Ongoing Classes
                      </span>
                    </div>

                    {/* Free slots count */}
                    <div className="hidden md:flex flex-col items-center">
                      <span className="text-2xl font-black text-green-500">
                        {freeSegments.length}
                      </span>
                      <span className="text-[8px] text-green-600 uppercase font-black tracking-widest">
                        Free Slots
                      </span>
                    </div>

                    <div
                      className={`w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center transition-all duration-500 ${
                        isExpanded
                          ? "bg-primary text-white rotate-180 border-primary"
                          : "bg-white text-gray-400 group-hover:text-primary"
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20" height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Expandable schedule table */}
                <div
                  className={`transition-all duration-500 ease-in-out border-t border-gray-100 overflow-hidden ${
                    isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="p-8 bg-gray-50/30">
                    {/* Availability summary bar */}
                    {item.availabilities?.length > 0 && (
                      <div className="mb-6 p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.25em] mb-3">
                          Defined Working Hours
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {item.availabilities.map((a: any, i: number) => (
                            <span
                              key={i}
                              className="text-[11px] bg-primary/5 border border-primary/20 text-primary font-bold px-3 py-1.5 rounded-lg"
                            >
                              {to12h(a.start_time)} – {to12h(a.end_time)}
                            </span>
                          ))}
                        </div>

                        {freeSegments.length > 0 && (
                          <div className="mt-3">
                            <p className="text-[9px] font-black text-green-600 uppercase tracking-[0.25em] mb-2">
                              Remaining Free Time
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {freeSegments.map((seg, i) => (
                                <span
                                  key={i}
                                  className="text-[11px] bg-green-50 border border-green-200 text-green-700 font-bold px-3 py-1.5 rounded-lg"
                                >
                                  {to12h(seg.start + ":00")} – {to12h(seg.end + ":00")}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-4 mb-6">
                      <div className="h-[1px] flex-1 bg-gray-200" />
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
                        Instructor Schedule Matrix
                      </span>
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
