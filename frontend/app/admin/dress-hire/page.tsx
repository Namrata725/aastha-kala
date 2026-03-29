"use client";

import React, { useEffect, useState } from "react";
import Table from "@/components/layout/Table";
import DeleteConfirmationModal from "@/components/layout/DeleteConfirmationModal";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";
import DressHireModal from "@/components/admin/DressHireModal";

interface Dress {
  id: number;
  title: string;
  order: number;
  images: string[];
}

const Page = () => {
  const [dresses, setDresses] = useState<Dress[]>([]);
  const [loading, setLoading] = useState(true);

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingDress, setEditingDress] = useState<Dress | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDress, setSelectedDress] = useState<Dress | null>(null);
  const [deleting, setDeleting] = useState(false);

  const getImageUrl = (path?: string) => {
    if (!path) return "";
    return path;
  };

  const fetchDresses = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/dress-hire`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      const result = await res.json();

      if (!res.ok) throw new Error(result.message);

      setDresses(result.data || []);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDresses();
  }, []);

  const columns = [
    { key: "sn", label: "SN" },
    { key: "image", label: "Image" },
    { key: "title", label: "Title" },
    { key: "order", label: "Order" },
  ];

  const formattedData = dresses.map((dress, index) => ({
    ...dress,
    sn: index + 1,

    image: dress.images?.length ? (
      <div className="relative w-12 h-12">
        <img
          src={getImageUrl(dress.images[0])}
          alt={dress.title}
          className="w-12 h-12 object-cover rounded-lg border"
        />

        {/* +N badge */}
        {dress.images.length > 1 && (
          <div className="absolute -top-2 -right-2 bg-black text-white text-xs px-1.5 py-0.5 rounded-full shadow">
            +{dress.images.length - 1}
          </div>
        )}
      </div>
    ) : (
      <span className="text-xs text-gray-400">No Image</span>
    ),
  }));

  const handleEdit = (row: any) => {
    const original = dresses.find((d) => d.id === row.id);
    setEditingDress(original || null);
    setFormModalOpen(true);
  };

  const handleDeleteClick = (row: any) => {
    const original = dresses.find((d) => d.id === row.id);
    setSelectedDress(original || null);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedDress) return;

    setDeleting(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/dress-hire/${selectedDress.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      const result = await res.json();

      if (!res.ok) throw new Error(result.message);

      toast.success("Deleted successfully");
      fetchDresses();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
      setDeleteModalOpen(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* header */}
      <div className="flex justify-between p-4">
        <h2 className="text-2xl font-bold">Dress Hire</h2>

        <button
          onClick={() => {
            setEditingDress(null);
            setFormModalOpen(true);
          }}
          className="px-6 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg flex gap-2 items-center"
        >
          <Plus className="w-4 h-4" />
          Add Dress
        </button>
      </div>

      {/* table */}
      <Table
        columns={columns}
        data={formattedData}
        loading={loading}
        actions={["edit", "delete"]}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />

      {/* add/edit modal */}
      <DressHireModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSuccess={fetchDresses}
        dress={editingDress}
      />

      {/* delete Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        loading={deleting}
        title="Delete Dress"
        description={`Delete "${selectedDress?.title}"?`}
      />
    </div>
  );
};

export default Page;
