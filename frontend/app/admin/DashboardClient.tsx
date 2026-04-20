"use client";

import React, { useEffect, useState } from "react";
import {
  Users,
  BookOpen,
  CalendarCheck,
  Clock,
  PlusCircle,
  UserPlus,
  Flag,
  Image as ImageIcon,
  ChevronRight,
  MessageSquare,
  Zap,
  Mail,
  Timer,
  CheckCircle2,
  XCircle,
  GraduationCap,
  CreditCard
} from "lucide-react";
import Link from "next/link";
import { useDashboard } from "@/lib/DashboardContext";

import ProgramAddEditModal from "@/components/admin/ProgramAddEditModal";
import InstructorModal from "@/components/admin/InstructorModal";
import EventAddEditModal from "@/components/admin/EventAddEditModal";
import GalleryAddEditModal from "@/components/admin/GalleryAddEditModal";
import StudentAddEditModal from "@/components/admin/StudentAddEditModal";
import BookingViewModal from "@/components/admin/BookingViewModal";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

/* ───────────────────────── helpers ───────────────────────── */

const fmt = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

const timeAgo = (date: string) => {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

const statusConfig: Record<
  string,
  { bg: string; text: string; dot: string; label: string }
> = {
  pending: {
    bg: "bg-amber-50",
    text: "text-amber-600",
    dot: "bg-amber-400",
    label: "Pending",
  },
  accepted: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    dot: "bg-emerald-400",
    label: "Accepted",
  },
  approved: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    dot: "bg-emerald-400",
    label: "Approved",
  },
  rejected: {
    bg: "bg-red-50",
    text: "text-red-600",
    dot: "bg-red-400",
    label: "Rejected",
  },
};

/* ─────────────────────── animated counter ─────────────────── */

const AnimatedNumber = ({ value, duration = 700, prefix = "" }: { value: number; duration?: number; prefix?: string }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = value / (duration / 16);
    const id = setInterval(() => {
      start += step;
      if (start >= value) {
        setDisplay(value);
        clearInterval(id);
      } else {
        setDisplay(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(id);
  }, [value, duration]);
  return <>{prefix}{fmt(display)}</>;
};

/* ─────────────────────── stat card (COMPACT) ────────────────────────── */

const StatCard = ({
  title,
  value,
  icon: Icon,
  accent,
  prefix = "",
  trend = "",
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  accent: string;
  prefix?: string;
  trend?: string;
}) => (
  <div className="relative bg-white border border-gray-100 rounded-[1.5rem] p-5 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_-5px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-500 group overflow-hidden">
    
    {/* Background glow */}
    <div
      className="absolute -right-10 -top-10 w-32 h-32 rounded-full blur-[60px] opacity-[0.08] group-hover:opacity-[0.15] transition-opacity duration-700"
      style={{ backgroundColor: accent }}
    />

    <div className="relative z-10">
      {/* Title + Icon in same row */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
          {title}
        </span>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm shrink-0"
          style={{
            background: `linear-gradient(135deg, ${accent}1A 0%, ${accent}0D 100%)`,
            border: `1px solid ${accent}26`,
          }}
        >
          <Icon className="w-5 h-5" style={{ color: accent }} />
        </div>
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-2">
        <p className="text-[28px] font-black text-gray-900 leading-none tracking-tight">
          <AnimatedNumber value={value} prefix={prefix} />
        </p>
        {trend && (
          <span className="text-[9px] font-bold tracking-wider text-emerald-600 bg-emerald-50 px-2 py-[2px] rounded-full whitespace-nowrap">
            {trend}
          </span>
        )}
      </div>

      {/* Bottom accent line */}
      <div
        className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-700 rounded-full"
        style={{ backgroundColor: accent }}
      />
    </div>
  </div>
);

/* ─────────────────────── quick action ─────────────────────── */

const QuickAction = ({
  title,
  desc,
  icon: Icon,
  onClick,
  accent,
}: {
  title: string;
  desc: string;
  icon: React.ElementType;
  onClick: () => void;
  accent: string;
}) => (
  <button
    onClick={onClick}
    className="relative bg-white border border-gray-200/80 rounded-2xl p-5 text-left shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:border-gray-300/80 transition-all duration-300 group overflow-hidden"
  >
    <div
      className="absolute inset-0 opacity-0 group-hover:opacity-[0.03] transition-opacity"
      style={{ backgroundColor: accent }}
    />
    <div className="relative z-10 flex items-start gap-4">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border transition-transform group-hover:scale-105"
        style={{ backgroundColor: `${accent}0D`, borderColor: `${accent}1A` }}
      >
        <Icon className="w-5 h-5" style={{ color: accent }} />
      </div>
      <div className="min-w-0">
        <span className="block text-sm font-bold text-gray-800 group-hover:text-gray-900 transition-colors truncate">
          {title}
        </span>
        <span className="block text-[11px] text-gray-400 mt-0.5 truncate">{desc}</span>
      </div>
    </div>
  </button>
);

/* ─────────────────────── status badge ─────────────────────── */

const StatusBadge = ({ status }: { status: string }) => {
  const cfg = statusConfig[status] || statusConfig.pending;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${cfg.bg} ${cfg.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

/* ─────────────────────── activity item ────────────────────── */

const ActivityItem = ({
  icon: Icon,
  color,
  title,
  time,
}: {
  icon: React.ElementType;
  color: string;
  title: string;
  time: string;
}) => (
  <div className="flex items-start gap-3">
    <div
      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border"
      style={{ backgroundColor: `${color}0D`, borderColor: `${color}1A` }}
    >
      <Icon className="w-3.5 h-3.5" style={{ color }} />
    </div>
    <div className="min-w-0 pt-0.5">
      <p className="text-[12px] font-semibold text-gray-700 leading-snug">{title}</p>
      <p className="text-[10px] text-gray-400 mt-0.5 font-medium">{time}</p>
    </div>
  </div>
);

/* ════════════════════════ MAIN DASHBOARD ════════════════════════ */

const Dashboard = () => {
  const { data, loading, categories, refreshData } = useDashboard();
  const router = useRouter();
  const [adminName, setAdminName] = useState("Admin");
  const [currentTime, setCurrentTime] = useState("");

  const [modals, setModals] = useState({
    program: false,
    instructor: false,
    event: false,
    gallery: false,
    student: false,
    viewBooking: false,
  });

  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.name) setAdminName(user.name);
      } catch {}
    }

    const tick = () =>
      setCurrentTime(
        new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    tick();
    const id = setInterval(tick, 1000);

    // Refresh dashboard data on mount
    refreshData();

    return () => clearInterval(id);
  }, [refreshData]);

  const openModal = (type: keyof typeof modals) =>
    setModals((p) => ({ ...p, [type]: true }));
  const closeModal = (type: keyof typeof modals) =>
    setModals((p) => ({ ...p, [type]: false }));

  const handleUpdateStatus = async (id: number, status: string, instructorId?: number, customStartTime?: string, customEndTime?: string) => {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/bookings/${id}/status`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({ status, instructor_id: instructorId, custom_start_time: customStartTime, custom_end_time: customEndTime }),
        });
        if (!res.ok) throw new Error("Update failed");
        toast.success(`Booking ${status}`);
        refreshData();
        closeModal("viewBooking");
    } catch (error: any) { 
      toast.error(error.message); 
    }
  };

  /* ── skeleton ── */
  if (loading && !data) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-8 w-64 bg-gray-200 rounded-lg" />
        <div className="grid grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-gray-100 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 h-80 bg-gray-100 rounded-2xl" />
          <div className="h-80 bg-gray-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  const stats = data?.stats || {};
  const recentBookings = data?.recent_bookings || [];
  const recentMessages = data?.recent_messages || [];

  return (
    <div className="space-y-8 pb-16">
      {/* ──── HEADER ──── */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-gray-400 text-sm font-medium mt-1">
            Welcome back,{" "}
            <span className="text-gray-600 font-semibold">{adminName}</span>.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Local Time
            </p>
            <p className="text-lg font-bold text-gray-700 tabular-nums tracking-tight">
              {currentTime}
            </p>
          </div>
          <div className="w-px h-10 bg-gray-200 hidden sm:block" />
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Today
            </p>
            <p className="text-sm font-semibold text-gray-600">
              {new Date().toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>

      {/* ──── KPI STATS (all values from API) ──── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Bookings"
          value={stats.total_bookings || 0}
          icon={CalendarCheck}
          accent="#2563EB"
        />
        <StatCard
          title="Pending Requests"
          value={stats.pending_bookings || 0}
          icon={Clock}
          accent="#D97706"
        />
        <StatCard
          title="Total Students"
          value={stats.total_students || 0}
          icon={GraduationCap}
          accent="#4F46E5"
        />
        <StatCard
          title="Total Revenue"
          value={stats.total_revenue || 0}
          icon={CreditCard}
          accent="#059669"
          prefix="Rs. "
        />
      </div>

      {/* ──── QUICK ACTIONS ──── */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <Zap className="w-4 h-4 text-gray-400" />
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-[0.15em]">
            Quick Actions
          </h2>
          <div className="h-px flex-1 bg-gray-100" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickAction
            title="New Student"
            desc="Register a new student"
            icon={UserPlus}
            accent="#0EA5E9"
            onClick={() => openModal("student")}
          />
          <QuickAction
            title="Manage Fees"
            desc="View billing & payments"
            icon={CreditCard}
            accent="#10B981"
            onClick={() => router.push("/admin/fees")}
          />
          <QuickAction
            title="Create Event"
            desc="Schedule an upcoming event"
            icon={Flag}
            accent="#EC4899"
            onClick={() => openModal("event")}
          />
          <QuickAction
            title="Gallery Upload"
            desc="Add photos to the gallery"
            icon={ImageIcon}
            accent="#3B82F6"
            onClick={() => openModal("gallery")}
          />
        </div>
      </div>

      {/* ──── MAIN CONTENT GRID ──── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* ── BOOKINGS TABLE ── */}
        <div className="xl:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <CalendarCheck className="w-4 h-4 text-blue-500" />
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-[0.15em]">
                Recent Bookings
              </h2>
              {recentBookings.length > 0 && (
                <span className="px-2 py-0.5 rounded-md bg-gray-100 text-[10px] font-bold text-gray-500">
                  {recentBookings.length}
                </span>
              )}
            </div>
            <Link
              href="/admin/booking"
              className="text-[10px] font-bold text-gray-400 uppercase tracking-wider hover:text-gray-700 transition-colors flex items-center gap-1"
            >
              View All
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            {recentBookings.length > 0 ? (
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left min-w-[600px] lg:min-w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="px-6 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                        Customer
                      </th>
                      <th className="px-6 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                        Program
                      </th>
                      <th className="px-6 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                        Status
                      </th>
                      <th className="px-6 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50 text-right">
                        Received
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {recentBookings.map((booking: any) => (
                      <tr
                        key={booking.id}
                        onClick={() => {
                          setSelectedBooking(booking);
                          setModals((p) => ({ ...p, viewBooking: true }));
                        }}
                        className="hover:bg-gray-50/80 transition-colors group cursor-pointer"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-[11px] font-bold text-gray-400 uppercase shrink-0">
                              {(booking.name || "?")[0]}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[13px] font-semibold text-gray-800 truncate max-w-[160px]">
                                {booking.name}
                              </p>
                              <p className="text-[11px] text-gray-400 truncate max-w-[160px]">
                                {booking.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[12px] font-medium text-sky-600 truncate block max-w-[180px]">
                            {booking.program?.title || "—"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={booking.status} />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-[11px] font-medium text-gray-400">
                            {timeAgo(booking.created_at)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-gray-300">
                <CalendarCheck className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-xs font-bold uppercase tracking-widest">
                  No bookings yet
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="xl:col-span-4 space-y-6">
          {/* Recent Messages */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4 text-violet-500" />
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-[0.15em]">
                  Inbox
                </h2>
                {recentMessages.length > 0 && (
                  <span className="px-2 py-0.5 rounded-md bg-violet-50 text-[10px] font-bold text-violet-500">
                    {recentMessages.length}
                  </span>
                )}
              </div>
              <Link
                href="/admin/contact"
                className="text-[10px] font-bold text-gray-400 uppercase tracking-wider hover:text-gray-700 transition-colors flex items-center gap-1"
              >
                All
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-3">
              {recentMessages.length > 0 ? (
                recentMessages.map((msg: any) => (
                  <div
                    key={msg.id}
                    className="bg-white border border-gray-200/80 rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.05)] hover:border-gray-300/80 transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-violet-50 border border-violet-100 flex items-center justify-center shrink-0 text-violet-500 group-hover:bg-violet-500 group-hover:text-white transition-colors">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[12px] font-semibold text-gray-800 truncate">
                            {msg.name}
                          </span>
                          <span className="text-[9px] font-bold text-gray-400 whitespace-nowrap">
                            {timeAgo(msg.created_at)}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">
                          &ldquo;{msg.message}&rdquo;
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          {msg.email && (
                            <span className="text-[9px] text-gray-300 font-medium truncate max-w-[130px]">
                              {msg.email}
                            </span>
                          )}
                          {msg.phone && (
                            <span className="text-[9px] text-gray-300 font-medium">
                              {msg.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white border border-dashed border-gray-200 rounded-xl p-12 flex flex-col items-center text-gray-300">
                  <MessageSquare className="w-8 h-8 mb-2 opacity-20" />
                  <p className="text-[11px] font-bold uppercase tracking-widest">
                    No messages
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ──── MODALS ──── */}
      <ProgramAddEditModal
        isOpen={modals.program}
        onClose={() => closeModal("program")}
        onSuccess={() => refreshData()}
        program={null}
      />
      <InstructorModal
        isOpen={modals.instructor}
        onClose={() => closeModal("instructor")}
        onSuccess={() => refreshData()}
        instructor={null}
      />
      <EventAddEditModal
        isOpen={modals.event}
        onClose={() => closeModal("event")}
        onSuccess={() => refreshData()}
        event={null}
      />
      <GalleryAddEditModal
        isOpen={modals.gallery}
        onClose={() => closeModal("gallery")}
        onSuccess={() => refreshData()}
        categories={categories}
        editData={null}
      />
      <StudentAddEditModal
        isOpen={modals.student}
        onClose={() => closeModal("student")}
        onSuccess={() => refreshData()}
        student={null}
      />

      <BookingViewModal
        isOpen={modals.viewBooking}
        onClose={() => closeModal("viewBooking")}
        booking={selectedBooking}
        onStatusUpdate={(status, instId, start, end) => {
          if (selectedBooking) handleUpdateStatus(selectedBooking.id, status, instId, start, end);
        }}
      />
    </div>
  );
};

export default Dashboard;