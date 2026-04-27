"use client";

import React, { useEffect, useState } from "react";
import Table from "@/components/layout/Table";
import DeleteConfirmationModal from "@/components/layout/DeleteConfirmationModal";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";
import InstructorModal from "@/components/admin/InstructorModal";
import InstructorViewModal from "@/components/admin/InstructorViewModal";
import InstructorAvailabilityModal from "@/components/admin/InstructorAvailabilityModal";
import { Clock } from "lucide-react";
import { Pagination } from "@/components/global/Pagination";

interface Instructor {
  id: number;
  name: string;
  title?: string;
  about?: string;
  facebook_url?: string;
  instagram_url?: string;
  email?: string;
  phone?: string;
  image?: string;
  created_at?: string;
}

const Page = () => {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedInstructor, setSelectedInstructor] =
    useState<Instructor | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState<Instructor | null>(
    null,
  );

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewingInstructor, setViewingInstructor] = useState<Instructor | null>(
    null,
  );

  const [availabilityModalOpen, setAvailabilityModalOpen] = useState(false);
  const [availabilityInstructor, setAvailabilityInstructor] = useState<Instructor | null>(null);

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

  const getInitials = (name: string) => {
    if (!name) return "?";

    const parts = name.trim().split(" ");
    return parts.length > 1
      ? parts[0].charAt(0) + parts[1].charAt(0)
      : parts[0].charAt(0);
  };

  const columns = [
    { key: "sn", label: "SN" },
    { key: "image", label: "Image" },
    { key: "name", label: "Name" },
    { key: "title", label: "Title" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
  ];

  const fetchInstructors = async (page: number = 1) => {
    try {
      setLoading(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/instructors?page=${page}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Failed to fetch instructors");
      }

      const list = result.data?.data || result.data || [];
      
      if (list.length === 0 && page > 1) {
          fetchInstructors(page - 1);
          return;
      }

      setInstructors(list);

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
    fetchInstructors();
  }, []);

  const formattedData = instructors.map((inst, index) => ({
    ...inst,
    sn: (pagination.currentPage - 1) * pagination.itemsPerPage + index + 1,

    image: inst.image ? (
      <div className="relative group">
        <img
          src={getImageUrl(inst.image)}
          alt={inst.name}
          className="w-12 h-12 rounded-xl object-cover ring-2 ring-border group-hover:ring-primary transition-all duration-300 shadow-sm"
        />
        <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
      </div>
    ) : (
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-sm font-black uppercase shadow-inner">
        {getInitials(inst.name)}
      </div>
    ),

    about: inst.about ? (
      <span className="text-sm text-text-secondary line-clamp-1 max-w-xs">{inst.about}</span>
    ) : (
      <span className="text-text-muted text-xs italic font-medium">No bio provided</span>
    ),
  }));

  const handleView = (row: any) => {
    const original = instructors.find((i) => i.id === row.id);
    setViewingInstructor(original || null);
    setViewModalOpen(true);
  };

  const handleEdit = (row: any) => {
    const original = instructors.find((i) => i.id === row.id);
    setEditingInstructor(original || null);
    setFormModalOpen(true);
  };

  const handleDeleteClick = (row: any) => {
    const original = instructors.find((i) => i.id === row.id);
    setSelectedInstructor(original || null);
    setDeleteModalOpen(true);
  };

  const handleAvailability = (row: any) => {
    const original = instructors.find((i) => i.id === row.id);
    setAvailabilityInstructor(original || null);
    setAvailabilityModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedInstructor) return;

    setDeleting(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/instructors/${selectedInstructor.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Delete failed");
      }

      toast.success("Instructor deleted successfully");

      fetchInstructors(pagination.currentPage);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setDeleting(false);
      setDeleteModalOpen(false);
      setSelectedInstructor(null);
    }
  };

  const actions: ("view" | "edit" | "delete")[] = ["view", "edit", "delete"];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-center p-6 bg-surface border border-border rounded-xl gap-6 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-primary/10 transition-colors duration-500" />
        
        <div className="relative z-10 flex flex-col items-center sm:items-start">
          <h1 className="text-xl lg:text-2xl font-black text-text-primary tracking-tight">
            Our Instructors
          </h1>
          <p className="text-[10px] text-text-muted font-black uppercase tracking-widest mt-1">Manage and organize your professional teaching staff</p>
        </div>

        <button
          onClick={() => {
            setEditingInstructor(null);
            setFormModalOpen(true);
          }}
          className="w-full sm:w-auto relative z-10 px-6 py-2 bg-primary text-white rounded-lg shadow-lg shadow-primary/20 flex gap-2 items-center justify-center cursor-pointer font-black uppercase tracking-widest text-[10px] hover:bg-primary-hover hover:-translate-y-0.5 active:scale-95 transition-all whitespace-nowrap"
        >
          <Plus className="h-4 w-4" strokeWidth={3} />
          <span>Add Instructor</span>
        </button>
      </div>

      <div className="mt-6">
        <Table
          columns={columns}
          data={formattedData}
          loading={loading}
          actions={actions}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          customActions={[
            {
              icon: <Clock className="h-4 w-4" />,
              label: "Availability",
              onClick: handleAvailability,
              color: "text-secondary",
            },
          ]}
          emptyMessage="No instructors found"
        />

        <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            itemsPerPage={pagination.itemsPerPage}
            onPageChange={(page) => fetchInstructors(page)}
        />
      </div>

      <InstructorModal
        isOpen={formModalOpen}
        onClose={() => {
          setFormModalOpen(false);
          setEditingInstructor(null);
        }}
        instructor={editingInstructor}
        onSuccess={fetchInstructors}
      />

      <InstructorViewModal
        key={editingInstructor?.id || "create"}
        isOpen={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setViewingInstructor(null);
        }}
        instructor={viewingInstructor}
      />

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        loading={deleting}
        title="Delete Instructor"
        description={`Are you sure you want to delete "${
          selectedInstructor?.name || ""
        }"? This action cannot be undone.`}
      />

      <InstructorAvailabilityModal
        isOpen={availabilityModalOpen}
        onClose={() => setAvailabilityModalOpen(false)}
        instructor={availabilityInstructor}
      />
    </div>
  );
};

export default Page;
