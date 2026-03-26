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
  TrendingUp,
  MessageSquare,
  AlertCircle
} from "lucide-react";
import toast from "react-hot-toast";
import Link from 'next/link';
import { useDashboard } from "@/lib/DashboardContext";

// Modals for shortcuts
import ProgramAddEditModal from "@/components/admin/ProgramAddEditModal";
import InstructorModal from "@/components/admin/InstructorModal";
import EventAddEditModal from "@/components/admin/EventAddEditModal";
import GalleryAddEditModal from "@/components/admin/GalleryAddEditModal";

const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
  <div className="bg-slate-50 border border-gray-200 rounded-2xl p-6 shadow-sm relative overflow-hidden group hover:border-primary/50 transition-all duration-300">
    <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity ${color}`} />
    <div className="flex justify-between items-start relative z-10">
      <div>
        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-3xl font-black text-gray-900">{value}</h3>
        {trend && (
          <div className="flex items-center gap-1 mt-2 text-[10px] font-bold text-green-600 uppercase">
            <TrendingUp className="w-3 h-3" />
            {trend} from last month
          </div>
        )}
      </div>
      <div className={`p-3 rounded-xl bg-slate-100 border border-gray-100 ${color.replace('bg-', 'text-')}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  </div>
);

const QuickAction = ({ title, icon: Icon, onClick, color }: any) => (
  <button 
    onClick={onClick}
    className="flex flex-col items-center justify-center gap-3 p-6 bg-slate-50 border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-primary/40 transition-all duration-300 group"
  >
    <div className={`p-4 rounded-2xl bg-slate-100 border border-gray-100 transition-transform group-hover:scale-110 ${color}`}>
      <Icon className="w-8 h-8" />
    </div>
    <span className="text-sm font-bold text-gray-600 group-hover:text-black transition-colors uppercase tracking-wider">{title}</span>
  </button>
);

const Dashboard = () => {
  const { data, loading, categories, refreshData } = useDashboard();
  const [adminName, setAdminName] = useState("Admin");

  // Modal States
  const [modals, setModals] = useState({
    program: false,
    instructor: false,
    event: false,
    gallery: false
  });

  useEffect(() => {
    // Get user from localStorage
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.name) setAdminName(user.name);
      } catch (e) {}
    }
  }, []);

  const openModal = (type: keyof typeof modals) => {
    setModals(prev => ({ ...prev, [type]: true }));
  };

  const closeModal = (type: keyof typeof modals) => {
    setModals(prev => ({ ...prev, [type]: false }));
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  const stats = data?.stats || {};
  const recentBookings = data?.recent_bookings || [];
  const recentMessages = data?.recent_messages || [];

  return (
    <div className="space-y-10 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-black uppercase tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px]">
            Welcome back, {adminName}. Here's what's happening today.
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Bookings" 
          value={stats.total_bookings || 0} 
          icon={CalendarCheck} 
          color="bg-blue-500"
          trend="+12%"
        />
        <StatCard 
          title="Pending Requests" 
          value={stats.pending_bookings || 0} 
          icon={Clock} 
          color="bg-yellow-500"
        />
        <StatCard 
          title="Instructors" 
          value={stats.total_instructors || 0} 
          icon={Users} 
          color="bg-purple-500"
        />
        <StatCard 
          title="Active Programs" 
          value={stats.total_programs || 0} 
          icon={BookOpen} 
          color="bg-pink-500"
        />
      </div>

      {/* Quick Actions Shortcuts */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-black uppercase tracking-widest italic">Quick Shortcuts</h2>
          <div className="h-[1px] flex-1 bg-slate-200" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <QuickAction 
            title="Add Program" 
            icon={PlusCircle} 
            color="text-primary"
            onClick={() => openModal('program')}
          />
          <QuickAction 
            title="New Instructor" 
            icon={UserPlus} 
            color="text-secondary"
            onClick={() => openModal('instructor')}
          />
          <QuickAction 
            title="Create Event" 
            icon={Flag} 
            color="text-pink-500"
            onClick={() => openModal('event')}
          />
          <QuickAction 
            title="Gallery Item" 
            icon={ImageIcon} 
            color="text-blue-400"
            onClick={() => openModal('gallery')}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Recent Bookings Table */}
        <div className="xl:col-span-2 space-y-6">
           <div className="flex justify-between items-center">
             <h2 className="text-xl font-bold text-black uppercase tracking-widest italic flex items-center gap-3">
               <CalendarCheck className="w-5 h-5 text-primary" />
               Recent Bookings
             </h2>
             <Link href="/admin/booking" className="text-[10px] font-black text-primary uppercase tracking-widest hover:text-black transition-colors flex items-center gap-1">
               View All <ChevronRight className="w-3 h-3" />
             </Link>
           </div>
           
           <div className="bg-slate-50 border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
             <table className="w-full text-left">
               <thead>
                 <tr className="border-b border-gray-100 bg-slate-100">
                   <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer</th>
                   <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Program</th>
                   <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                   <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                 {recentBookings.length > 0 ? recentBookings.map((booking: any) => (
                   <tr key={booking.id} className="hover:bg-slate-100 transition-colors">
                     <td className="px-6 py-4">
                       <div className="flex flex-col">
                         <span className="text-sm font-bold text-black">{booking.name}</span>
                         <span className="text-[10px] text-black/50 truncate max-w-[150px]">{booking.email}</span>
                       </div>
                     </td>
                     <td className="px-6 py-4">
                       <span className="text-xs font-medium text-secondary">{booking.program?.title || 'Unknown'}</span>
                     </td>
                     <td className="px-6 py-4">
                       <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter
                         ${booking.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' : 
                           booking.status === 'approved' ? 'bg-green-500/10 text-green-500' : 
                           'bg-red-500/10 text-red-500'}`}
                       >
                         {booking.status}
                       </span>
                     </td>
                     <td className="px-6 py-4 text-xs font-bold text-black/60">
                       {new Date(booking.created_at).toLocaleDateString()}
                     </td>
                   </tr>
                 )) : (
                   <tr>
                     <td colSpan={4} className="px-6 py-12 text-center text-black/20 italic text-sm font-bold uppercase tracking-widest">No recent bookings</td>
                   </tr>
                 )}
               </tbody>
             </table>
           </div>
        </div>

        {/* Recent Messages */}
        <div className="space-y-6">
           <div className="flex justify-between items-center">
             <h2 className="text-xl font-bold text-black uppercase tracking-widest italic flex items-center gap-3">
               <MessageSquare className="w-5 h-5 text-secondary" />
               Recent Inbox
             </h2>
             <Link href="/admin/contact" className="text-[10px] font-black text-secondary uppercase tracking-widest hover:text-black transition-colors flex items-center gap-1">
               View All <ChevronRight className="w-3 h-3" />
             </Link>
           </div>

           <div className="space-y-4">
             {recentMessages.length > 0 ? recentMessages.map((msg: any) => (
               <div key={msg.id} className="bg-slate-50 border border-gray-300 rounded-2xl p-4 flex gap-4 hover:border-secondary/40 transition-all group">
                 <div className="w-10 h-10 rounded-xl bg-slate-50 border border-gray-300 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-black transition-colors">
                   <MessageSquare className="w-5 h-5" />
                 </div>
                 <div className="flex-1 space-y-1">
                   <div className="flex justify-between items-start">
                     <span className="text-sm font-bold text-black truncate max-w-[120px]">{msg.name}</span>
                     <span className="text-[9px] font-black text-black/40 uppercase whitespace-nowrap">{new Date(msg.created_at).toLocaleDateString()}</span>
                   </div>
                   <p className="text-[11px] text-black/60 line-clamp-1 italic">"{msg.message}"</p>
                 </div>
               </div>
             )) : (
               <div className="bg-slate-50 border border-dashed border-gray-300 rounded-2xl p-12 flex flex-col items-center justify-center text-black/10">
                 <AlertCircle className="w-10 h-10 mb-2 opacity-20" />
                 <span className="text-xs font-bold uppercase tracking-widest">Inbox is empty</span>
               </div>
             )}
           </div>
        </div>
      </div>

      {/* Shortcut Modals */}
      <ProgramAddEditModal 
        isOpen={modals.program} 
        onClose={() => closeModal('program')} 
        onSuccess={() => { refreshData(); }} 
        program={null}
      />
      <InstructorModal 
        isOpen={modals.instructor} 
        onClose={() => closeModal('instructor')} 
        onSuccess={() => { refreshData(); }} 
        instructor={null}
      />
      <EventAddEditModal 
        isOpen={modals.event} 
        onClose={() => closeModal('event')} 
        onSuccess={() => { refreshData(); }} 
        event={null}
      />
      <GalleryAddEditModal 
        isOpen={modals.gallery} 
        onClose={() => closeModal('gallery')} 
        onSuccess={() => { refreshData(); }} 
        categories={categories}
        editData={null}
      />
    </div>
  );
};

export default Dashboard;
