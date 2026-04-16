"use client";

import React, { useEffect, useState } from "react";
import Table from "@/components/layout/Table";
import DeleteConfirmationModal from "@/components/layout/DeleteConfirmationModal";
import { Plus, Check, X, Eye, AlertCircle, Search } from "lucide-react";
import toast from "react-hot-toast";
import BookingViewModal from "@/components/admin/BookingViewModal";
import { Pagination } from "@/components/global/Pagination";
import { to12h } from "@/lib/timeFormat";

const statusColors: any = {
  pending: "bg-yellow-500/10 text-yellow-500",
  accepted: "bg-green-500/10 text-green-500",
  rejected: "bg-red-500/10 text-red-500",
};

const BookingManagementPage = () => {
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "accepted" | "rejected">("all");

    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10,
    });

    const [selectedBooking, setSelectedBooking] = useState<any>(null);
    const [viewModalOpen, setViewModalOpen] = useState(false);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const columns = [
        { key: "sn", label: "SN" },
        { key: "customer", label: "Customer Info" },
        { key: "programInfo", label: "Class Requested" },
        { key: "date_time", label: "When" },
        { key: "status_badge", label: "Status" },
    ];

    const fetchBookings = async (page: number = 1) => {
        try {
            setLoading(true);
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/bookings?page=${page}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                cache: "no-store"
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.message || "Failed to fetch bookings");
            
            const data = result.data?.data || result.data || [];
            if (data.length === 0 && page > 1) {
                fetchBookings(page - 1);
                return;
            }

            setBookings(data);
            
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

    useEffect(() => { fetchBookings(); }, []);

    const updateBookingStatus = async (id: number, status: string, instructorId?: number, customStartTime?: string, customEndTime?: string) => {
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
            fetchBookings();
            setViewModalOpen(false);
        } catch (error: any) { toast.error(error.message); }
    };

    const confirmDelete = async () => {
        if (!selectedBooking) return;
        setDeleting(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/bookings/${selectedBooking.id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            if (!res.ok) throw new Error("Delete failed");
            toast.success("Booking record removed");
            fetchBookings(pagination.currentPage);
        } catch (error: any) { toast.error(error.message); }
        finally { setDeleting(false); setDeleteModalOpen(false); }
    };

    const filteredBookings = bookings.filter((b: any) => 
        (b.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
         b.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         b.program?.title?.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (statusFilter === "all" || b.status === statusFilter)
    );

    const formattedData = filteredBookings.map((b: any, index: number) => ({
        ...b,
        sn: (pagination.currentPage - 1) * pagination.itemsPerPage + index + 1,
        customer: (
            <div className="flex flex-col">
                <span className="text-sm font-bold text-black">{b.name}</span>
                <span className="text-[10px] text-gray-500 tracking-tight">{b.email}</span>
            </div>
        ),
        programInfo: (
            <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-secondary">{b.program?.title}</span>
                <div className="flex items-center gap-2">
                   <span className="text-[9px] bg-gray-50 border border-gray-100 px-1 py-0.5 rounded text-gray-500 font-medium uppercase">{b.class_mode}</span>
                   <span className={`text-[9px] px-1 py-0.5 rounded font-bold uppercase ${b.type === 'regular' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary border border-secondary/20'}`}>{b.type}</span>
                </div>
            </div>
        ),
        date_time: (
            <div className="flex flex-col">
              <span className="text-xs font-bold text-black">{b.booking_date}</span>
              <span className="text-[10px] text-gray-500 italic">
                {b.type === 'regular' ? (
                  b.schedule ? `${to12h(b.schedule.start_time)} - ${to12h(b.schedule.end_time)}` : 
                  (b.schedules && b.schedules.length > 0 ? 
                    `${to12h(b.schedules[0].start_time)} - ${to12h(b.schedules[0].end_time)}${b.schedules.length > 1 ? ' (+)' : ''}` : 
                    "No slot")
                ) : (
                  `${to12h(b.custom_start_time)} - ${to12h(b.custom_end_time)}`
                )}
              </span>
            </div>
        ),
        status_badge: (
            <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold text-center block ${statusColors[b.status]}`}>
                {b.status}
            </span>
        ),
    }));

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center p-6 bg-white border border-gray-200 rounded-2xl gap-6 shadow-sm">
                <div className="flex flex-col text-center md:text-left">
                    <span className="text-2xl font-bold text-black">Booking Requests</span>
                    <span className="text-xs text-gray-500 font-medium uppercase tracking-widest mt-0.5">Approve or reject student registration requests</span>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="relative flex-1 md:w-64">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Search names, emails or programs..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary transition shadow-sm"
                    />
                  </div>
                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as "all" | "pending" | "accepted" | "rejected")}
                    className="px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-primary transition shadow-sm min-w-[120px] cursor-pointer"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4 p-2 cursor-pointer">
                  {filteredBookings.length} / {bookings.length} bookings ({statusFilter !== "all" ? statusFilter : "all status"})
                </div>
                <Table
                    columns={columns}
                    data={formattedData}
                    loading={loading}
                    actions={["edit", "delete"]}
                    onEdit={(row) => { setSelectedBooking(bookings.find((b: any) => b.id === row.id)); setViewModalOpen(true); }}
                    onDelete={(row) => { setSelectedBooking(row); setDeleteModalOpen(true); }}
                    emptyMessage="No booking requests found"
                />

                <Pagination
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    totalItems={pagination.totalItems}
                    itemsPerPage={pagination.itemsPerPage}
                    onPageChange={(page) => fetchBookings(page)}
                />
            </div>

            <BookingViewModal
                isOpen={viewModalOpen}
                onClose={() => setViewModalOpen(false)}
                booking={selectedBooking}
                onStatusUpdate={(status, instructorId, customStartTime, customEndTime) => {
                    if (selectedBooking) updateBookingStatus(selectedBooking.id, status, instructorId, customStartTime, customEndTime);
                }}
            />

            <DeleteConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                loading={deleting}
                title="Discard Booking Record?"
                description="This will permanently delete this student's booking data. Only do this if you have archived their contact info."
            />
        </div>
    );
};

export default BookingManagementPage;
