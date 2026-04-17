"use client";

import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import Table from "@/components/layout/Table";
import DeleteConfirmationModal from "@/components/layout/DeleteConfirmationModal";
import { Plus, BookOpen, Clock, User } from "lucide-react";
import toast from "react-hot-toast";
import ProgramAddEditModal from "@/components/admin/ProgramAddEditModal";
import ProgramViewModal from "@/components/admin/ProgramViewModal";
import { Pagination } from "@/components/global/Pagination";

interface Program {
    id: string;
    image: string | null;
    title: string;
    schedules: any[]; // You might want to define a more specific type for schedules
    is_active: boolean;
    program_fee: number;
    admission_fee: number;
    // Add any other properties that a program object might have
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
            <img
                src={getImageUrl(p.image)}
                className="w-10 h-10 rounded object-cover"
            />
            ) : (
            <div className="w-10 h-10 flex items-center justify-center rounded bg-gray-100 text-[10px] text-gray-400 font-medium">
                No Image
            </div>
            ),
        fees_display: (
            <div className="flex flex-col">
                <span className="text-[12px] font-bold text-gray-900 leading-none">Rs. {p.program_fee || 0}</span>
            </div>
        ),
        schedule_count: (
            <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-primary">{p.schedules?.length || 0} slots</span>
                {/* <span className="text-[10px] text-gray-500 uppercase tracking-tighter hover:text-black cursor-pointer" onClick={() => handleView(p)}>View Details</span> */}
            </div>
        ),
        status: (
            <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${p.is_active ? 'bg-green-500 text-black' : 'bg-red-500 text-black'}`}>
                {p.is_active ? 'Active' : 'Inactive'}
            </span>
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
            toast.success("Program deleted");
            fetchPrograms(pagination.currentPage);
        } catch (error: any) { toast.error(error.message); }
        finally { setDeleting(false); setDeleteModalOpen(false); }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col lg:flex-row justify-between items-center p-6 bg-white border border-gray-200 rounded-2xl gap-6 shadow-sm mb-6">
                <div className="flex flex-col text-center lg:text-left">
                    <span className="text-2xl font-bold text-black">Program Catalog</span>
                    <span className="text-xs text-gray-500 font-medium uppercase tracking-widest mt-0.5">Search programs, filter by status</span>
                </div>
                <div className="flex items-center gap-4 w-full lg:w-auto">
                  <div className="relative flex-1 lg:w-64">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Search program title..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary transition shadow-sm"
                    />
                  </div>
                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive")}
                    className="px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-primary transition shadow-sm min-w-[120px]"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <button
                    onClick={() => { setEditingProgram(null); setFormModalOpen(true); }}
                    className="px-6 py-2.5 bg-gradient-to-r from-primary to-secondary text-white rounded-xl shadow-xl hover:scale-105 transition active:scale-95 flex gap-2 items-center text-sm font-semibold uppercase tracking-tight"
                  >
                    <Plus className="w-4 h-4" /> Add Program
                  </button>
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

            <ProgramAddEditModal
                isOpen={formModalOpen}
                onClose={() => setFormModalOpen(false)}
                program={editingProgram}
                onSuccess={() => {
                    setSearchTerm("");
                    fetchPrograms();
                }}
            />

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
        </div>
    );
};

export default ProgramsPage;
