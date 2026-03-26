"use client";

import React, { useEffect, useState } from "react";
import Table from "@/components/layout/Table";
import DeleteConfirmationModal from "@/components/layout/DeleteConfirmationModal";
import TestimonialAddEdit from "@/components/admin/TestimonialAddEdit";
import toast from "react-hot-toast";
import { Plus, Star } from "lucide-react";
import { Pagination } from "@/components/global/Pagination";

interface Testimonial {
  id: number;
  name: string;
  description: string;
  rating: number;
  order: number;
  image?: string | null;
  created_at?: string;
}

const Page = () => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const IMAGE_BASE = process.env.NEXT_PUBLIC_IMAGE_URL;

  const [data, setData] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(false);

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Testimonial | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

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

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={16}
            className={
              i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-400"
            }
          />
        ))}
      </div>
    );
  };

  const columns = [
    { key: "sn", label: "SN" },
    { key: "image", label: "Image" },
    { key: "name", label: "Name" },
    { key: "description", label: "Description" },
    { key: "rating", label: "Rating" },
    { key: "order", label: "Order" },
  ];

  const fetchData = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/admin/testimonials`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Failed to fetch testimonials");
      }

      setData(json.data?.data || json.data || []);
      
      if (json.data?.last_page) {
        setPagination({
          currentPage: json.data.current_page,
          totalPages: json.data.last_page,
          totalItems: json.data.total,
          itemsPerPage: json.data.per_page,
        });
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formattedData = data.map((item, index) => ({
    ...item,
    sn: (pagination.currentPage - 1) * pagination.itemsPerPage + index + 1,

    image: item.image ? (
      <img
        src={getImageUrl(item.image)}
        alt={item.name}
        className="w-10 h-10 rounded-full object-cover"
      />
    ) : (
      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white text-sm font-semibold uppercase">
        {getInitials(item.name)}
      </div>
    ),

    rating: renderStars(item.rating),

    description:
      item.description.length > 150
        ? item.description.slice(0, 150) + "..."
        : item.description,
  }));

  const handleEdit = (row: any) => {
    const original = data.find((i) => i.id === row.id);
    setEditingItem(original || null);
    setFormModalOpen(true);
  };

  const handleDeleteClick = (row: any) => {
    const original = data.find((i) => i.id === row.id);
    setSelectedItem(original || null);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedItem) return;

    setDeleting(true);

    try {
      const res = await fetch(
        `${API_URL}/admin/testimonials/${selectedItem.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Delete failed");
      }

      toast.success("Deleted successfully");

      setData((prev) => prev.filter((i) => i.id !== selectedItem.id));
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setDeleting(false);
      setDeleteModalOpen(false);
      setSelectedItem(null);
    }
  };

  const actions: ("edit" | "delete")[] = ["edit", "delete"];

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
          Testimonials
        </span>

        <button
          onClick={() => {
            setEditingItem(null);
            setFormModalOpen(true);
          }}
          className="px-6 py-2 text-sm bg-gradient-to-r from-primary to-secondary text-white rounded-lg flex gap-2 items-center"
        >
          <Plus className="h-4 w-4" />
          Add Testimonial
        </button>
      </div>

      <Table
        columns={columns}
        data={formattedData}
        loading={loading}
        actions={actions}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        emptyMessage="No testimonials found"
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
                      const res = await fetch(`${API_URL}/admin/testimonials?page=${p}`, {
                          headers: {
                              Authorization: `Bearer ${localStorage.getItem("token")}`,
                          },
                      });
                      const json = await res.json();
                      setData(json.data?.data || []);
                      setPagination({
                          currentPage: json.data.current_page,
                          totalPages: json.data.last_page,
                          totalItems: json.data.total,
                          itemsPerPage: json.data.per_page,
                      });
                  } finally {
                      setLoading(false);
                  }
              };
              fetchWithPage(page);
          }}
      />

      {/* Add/Edit Modal */}
      <TestimonialAddEdit
        isOpen={formModalOpen}
        onClose={() => {
          setFormModalOpen(false);
          setEditingItem(null);
        }}
        initialData={editingItem}
        onSuccess={fetchData}
      />

      {/* Delete Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        loading={deleting}
        title="Delete Testimonial"
        description={`Are you sure you want to delete "${selectedItem?.name || ""}"?`}
      />
    </div>
  );
};

export default Page;
