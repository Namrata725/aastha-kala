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

  const fetchInstructors = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/instructors`,
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

    sn: index + 1,

    image: inst.image ? (
      <img
        src={inst.image}
        alt={inst.name}
        className="w-10 h-10 rounded-full object-cover"
      />
    ) : (
      <div className="w-10 h-10 rounded-full bg-linear-to-r from-primary to-secondary flex items-center justify-center text-white text-xs font-semibold uppercase">
        {getInitials(inst.name)}
      </div>
    ),

    about: inst.about ? (
      <span className="line-clamp-2 max-w-xs">{inst.about}</span>
    ) : (
      <span className="text-white/50 text-xs">N/A</span>
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

      toast.success("Instructor deleted");

      setInstructors((prev) =>
        prev.filter((i) => i.id !== selectedInstructor.id),
      );
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
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between p-4">
        <span className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-primary to-secondary">
          Our Instructors
        </span>

        <button
          onClick={() => {
            setEditingInstructor(null);
            setFormModalOpen(true);
          }}
          className="px-6 py-2 text-sm bg-linear-to-r from-primary to-secondary text-white rounded-lg flex gap-2 items-center cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Add Instructor
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
            onPageChange={(page) => {
                const fetchWithPage = async (p: number) => {
                    setLoading(true);
                    try {
                        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/instructors?page=${p}`, {
                            headers: {
                                Accept: "application/json",
                                Authorization: `Bearer ${localStorage.getItem("token")}`,
                            },
                        });
                        const result = await res.json();
                        setInstructors(result.data?.data || []);
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
