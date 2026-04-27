"use client";

import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import Table from "@/components/layout/Table";
import DeleteConfirmationModal from "@/components/layout/DeleteConfirmationModal";
import { Plus, BookOpen, Clock, User } from "lucide-react";
import { toast } from "sonner";
import ProgramViewModal from "@/components/admin/ProgramViewModal";
import { Pagination } from "@/components/global/Pagination";
import { ProgramForm } from "@/components/admin/program/programform";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { Toaster } from "sonner";

interface Program {
    id: string;
    image: string | null;
    title: string;
    schedules: any[];
    is_active: boolean;
    program_fee: number;
    admission_fee: number;
    sub_programs?: Program[];
}

const ProgramsPage = () => {
    const [programs, setPrograms] = useState<Program[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10,
    });

    const IMAGE_BASE = process.env.NEXT_PUBLIC_IMAGE_URL;

    const getImageUrl = (path?: string | null) => {
        if (!path) return "";
        if (path.startsWith("http")) return path;
        return `${IMAGE_BASE?.replace(/\/$/, "")}/${path.replace(/^\/+/, "")}`;
    };

    const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [formModalOpen, setFormModalOpen] = useState(false);
    const [editingProgram, setEditingProgram] = useState<Program | null>(null);

    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [viewingProgram, setViewingProgram] = useState<Program | null>(null);

    const columns = [
        { key: "sn", label: "SN" },
        { key: "image", label: "Image" },
        { key: "title", label: "Program Name" },
        { key: "fees_display", label: "Program Fee" },
        { key: "sub_count", label: "Sub Programs" },
        { key: "schedule_count", label: "Schedules" },
        { key: "status", label: "Status" },
    ];

    const fetchPrograms = async (page: number = 1) => {
        try {
            setLoading(true);
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/programs?page=${page}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.message || "Failed to fetch programs");
            
            const data = result.data?.data || result.data || [];
            if (data.length === 0 && page > 1) {
                fetchPrograms(page - 1);
                return;
            }

            setPrograms(data);
            
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

    useEffect(() => { fetchPrograms(); }, []);

    const filteredPrograms = programs.filter((p: Program) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (statusFilter === "all" || 
       (statusFilter === "active" && p.is_active) ||
       (statusFilter === "inactive" && !p.is_active))
    );

    const formattedData = filteredPrograms.map((p: Program, index: number) => ({
        ...p,
        sn: (pagination.currentPage - 1) * pagination.itemsPerPage + index + 1,
        image: p.image ? (
            <div className="relative group/img">
                <img
                    src={getImageUrl(p.image)}
                    className="w-12 h-12 rounded-xl object-cover ring-2 ring-border group-hover/img:ring-primary transition-all duration-300 shadow-sm"
                />
                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover/img:opacity-100 transition-opacity rounded-xl" />
            </div>
            ) : (
            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-primary/5 text-[10px] text-primary/40 font-black uppercase shadow-inner">
                Empty
            </div>
            ),
        fees_display: (
            <div className="flex flex-col">
                <span className="text-sm font-black text-text-primary tracking-tight">Rs. {p.program_fee || 0}</span>
                <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-0.5">Per Month</span>
            </div>
        ),
        sub_count: (
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-secondary" />
                    <span className="text-sm font-black text-text-primary tracking-tight">{p.sub_programs?.length || 0} Optional</span>
                </div>
            </div>
        ),
        schedule_count: (
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    <span className="text-sm font-black text-text-primary tracking-tight">{p.schedules?.length || 0} Slots</span>
                </div>
            </div>
        ),
        status: (
            <div className="flex">
                <span className={`px-3 py-1 rounded-lg text-[10px] uppercase font-black tracking-widest border transition-all duration-300 ${
                    p.is_active 
                    ? 'bg-success/10 text-success border-success/20 shadow-sm shadow-success/10' 
                    : 'bg-error/10 text-error border-error/20 shadow-sm shadow-error/10'
                }`}>
                    {p.is_active ? 'Active' : 'Inactive'}
                </span>
            </div>
        ),
    }));

    const handleView = (row: Program) => {
        setViewingProgram(programs.find((p: Program) => p.id === row.id) || null);
        setViewModalOpen(true);
    };

    const handleEdit = (row: Program) => {
        setEditingProgram(programs.find((p: Program) => p.id === row.id) || null);
        setFormModalOpen(true);
    };

    const handleDeleteClick = (row: Program) => {
        setSelectedProgram(row);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedProgram) return;
        setDeleting(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/programs/${selectedProgram.id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            if (!res.ok) throw new Error("Delete failed");
            toast.success("Program deleted successfully");
            fetchPrograms(pagination.currentPage);
        } catch (error: any) { toast.error(error.message); }
        finally { setDeleting(false); setDeleteModalOpen(false); }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col lg:flex-row justify-between items-center p-6 bg-surface border border-border rounded-xl gap-6 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full -mr-40 -mt-40 blur-3xl group-hover:bg-primary/10 transition-colors duration-500" />
                
                <div className="relative z-10 flex flex-col items-center lg:items-start">
                    <h1 className="text-xl lg:text-2xl font-black text-text-primary tracking-tight">Program Catalog</h1>
                    <p className="text-[10px] text-text-muted font-black uppercase tracking-widest mt-1">Manage courses, fees, and scheduling</p>
                </div>

                <div className="relative z-10 flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                  <div className="relative w-full sm:w-64 group/search">
                    <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within/search:text-primary transition-colors" />
                    <input 
                      type="text" 
                      placeholder="Search programs..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-sm font-medium focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all shadow-sm placeholder:text-text-muted"
                    />
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive")}
                        className="flex-1 sm:flex-none px-4 py-2 text-xs font-black uppercase tracking-widest bg-background border border-border rounded-lg focus:outline-none focus:border-primary transition-all shadow-sm cursor-pointer"
                    >
                        <option value="all">Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                    <button
                        onClick={() => { setEditingProgram(null); setFormModalOpen(true); }}
                        className="flex-1 sm:flex-none px-6 py-2 bg-primary text-white rounded-lg shadow-lg shadow-primary/20 hover:bg-primary-hover hover:-translate-y-0.5 active:scale-95 transition-all flex gap-2 items-center justify-center text-[10px] font-black uppercase tracking-widest cursor-pointer whitespace-nowrap"
                    >
                        <Plus className="w-4 h-4" strokeWidth={3} /> <span>Add Program</span>
                    </button>
                  </div>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm transition duration-500">
                <Table
                    columns={columns}
                    data={formattedData}
                    loading={loading}
                    actions={["view", "edit", "delete"]}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                    emptyMessage="No programs found"
                />
                
                <Pagination
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    totalItems={pagination.totalItems}
                    itemsPerPage={pagination.itemsPerPage}
                    onPageChange={(page) => fetchPrograms(page)}
                />
            </div>

            <AnimatePresence>
                {formModalOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md overflow-y-auto"
                    >
                        <div className="min-h-screen py-12 px-4">
                            <ProgramForm 
                                initialData={editingProgram}
                                onSuccess={() => {
                                    setFormModalOpen(false);
                                    fetchPrograms();
                                }}
                                onCancel={() => setFormModalOpen(false)}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <ProgramViewModal
                isOpen={viewModalOpen}
                onClose={() => setViewModalOpen(false)}
                program={viewingProgram}
            />

            <DeleteConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                loading={deleting}
                title="Remove Program?"
                description="This will delete the program and all its linked schedules. This action is irreversible."
            />

            <Toaster richColors position="top-right" />
        </div>
    );
};

export default ProgramsPage;
