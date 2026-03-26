"use client";

import React, { useEffect, useState } from "react";
import Table from "@/components/layout/Table";
import DeleteConfirmationModal from "@/components/layout/DeleteConfirmationModal";
import { Plus, Check, X, Eye, AlertCircle, Search } from "lucide-react";
import toast from "react-hot-toast";
import BookingViewModal from "@/components/admin/BookingViewModal";
import { Pagination } from "@/components/global/Pagination";

const statusColors: any = {
  pending: "bg-yellow-500/10 text-yellow-500",
  accepted: "bg-green-500/10 text-green-500",
  rejected: "bg-red-500/10 text-red-500",
};

const BookingManagementPage = () => {
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

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

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/bookings`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.message || "Failed to fetch bookings");
            setBookings(result.data?.data || result.data || []);
            
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

    const updateBookingStatus = async (id: number, status: string, instructorId?: number) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/bookings/${id}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ status, instructor_id: instructorId }),
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
            fetchBookings();
        } catch (error: any) { toast.error(error.message); }
        finally { setDeleting(false); setDeleteModalOpen(false); }
    };

    const filteredBookings = bookings.filter((b: any) => 
        b.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        b.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.program?.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formattedData = filteredBookings.map((b: any, index: number) => ({
        ...b,
        sn: index + 1,
        customer: (
            <div className="flex flex-col">
                <span className="text-sm font-bold text-white">{b.name}</span>
                <span className="text-[10px] text-white/30 uppercase tracking-tight">{b.email}</span>
            </div>
        ),
        programInfo: (
            <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-secondary">{b.program?.title}</span>
                <div className="flex items-center gap-2">
                   <span className="text-[9px] bg-white/5 border border-white/10 px-1 py-0.5 rounded text-white/60 font-medium uppercase">{b.class_mode}</span>
                   <span className={`text-[9px] px-1 py-0.5 rounded font-bold uppercase ${b.type === 'regular' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary border border-secondary/20'}`}>{b.type}</span>
                </div>
            </div>
        ),
        date_time: (
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white">{b.booking_date}</span>
              <span className="text-[10px] text-white/40 italic">
                {b.type === 'regular' ? `${b.schedule?.start_time?.substring(0, 5)} - ${b.schedule?.end_time?.substring(0, 5)}` : `${b.custom_start_time?.substring(0, 5)} - ${b.custom_end_time?.substring(0, 5)}`}
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
            <div className="flex flex-col md:flex-row justify-between items-center p-6 bg-white/5 border border-white/10 rounded-2xl gap-6">
                <div className="flex flex-col text-center md:text-left">
                    <span className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-primary to-secondary">Booking Requests</span>
                    <span className="text-xs text-white/40 font-medium uppercase tracking-widest mt-0.5">Approve or reject student registration requests</span>
                </div>

                <div className="relative w-full md:w-80">
                   <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                   <input 
                     type="text" 
                     placeholder="Search names, emails or programs..." 
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="w-full bg-black/40 border border-white/10 rounded-xl px-10 py-2.5 text-sm text-white focus:outline-none focus:border-primary transition"
                   />
                </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
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
                    onPageChange={(page) => {
                        const fetchWithPage = async (p: number) => {
                            setLoading(true);
                            try {
                                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/bookings?page=${p}`, {
                                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                                });
                                const result = await res.json();
                                setBookings(result.data?.data || []);
                                setPagination({
                                    currentPage: result.data.current_page,
                                    totalPages: result.data.last_page,
                                    totalItems: result.data.total,
                                    itemsPerPage: result.data.per_page,
                                });
                            } finally {
                                setLoading(false);
                            }
                        };
                        fetchWithPage(page);
                    }}
                />
            </div>

            <BookingViewModal
                isOpen={viewModalOpen}
                onClose={() => setViewModalOpen(false)}
                booking={selectedBooking}
                onStatusUpdate={(status, instructorId) => {
                    if (selectedBooking) updateBookingStatus(selectedBooking.id, status, instructorId);
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
