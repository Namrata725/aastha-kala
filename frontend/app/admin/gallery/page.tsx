"use client";

import React, { useEffect, useState } from "react";
import Table from "@/components/layout/Table";
import DeleteConfirmationModal from "@/components/layout/DeleteConfirmationModal";
import { Plus, Tag } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

interface Gallery {
  id: number;
  title: string;
  type: string;
  position?: number;
  video?: string;
  images?: string[];
  category?: {
    id: number;
    name: string;
  };
}

const Page = () => {
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedGallery, setSelectedGallery] = useState<Gallery | null>(null);
  const [deleting, setDeleting] = useState(false);

  const columns = [
    { key: "sn", label: "SN" },
    { key: "preview", label: "Preview" },
    { key: "title", label: "Title" },
    { key: "type", label: "Type" },
    { key: "category", label: "Category" },
    { key: "position", label: "Position" },
  ];

  const fetchGalleries = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/galleries`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Failed to fetch galleries");
      }

      const list = result.data?.data || result.data || [];
      setGalleries(list);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleries();
  }, []);

  const formattedData = galleries.map((item, index) => ({
    ...item,

    sn: index + 1,

    category: item.category?.name || "N/A",

    preview:
      item.type === "video" && item.video ? (
        <video src={item.video} className="w-16 h-10 object-cover rounded" />
      ) : item.images && item.images.length > 0 ? (
        <img src={item.images[0]} className="w-10 h-10 object-cover rounded" />
      ) : (
        <span className="text-white/50 text-xs">N/A</span>
      ),
  }));

  const handleDeleteClick = (row: any) => {
    const original = galleries.find((g) => g.id === row.id);
    setSelectedGallery(original || null);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedGallery) return;

    setDeleting(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/galleries/${selectedGallery.id}`,
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

      toast.success("Gallery deleted");

      setGalleries((prev) => prev.filter((g) => g.id !== selectedGallery.id));
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setDeleting(false);
      setDeleteModalOpen(false);
      setSelectedGallery(null);
    }
  };

  const actions: ("view" | "edit" | "delete")[] = ["view", "edit", "delete"];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between p-4">
        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
          Our Instructors
        </span>
        <div className="flex gap-2">
          <Link href="/admin/gallery/category">
            <button className="px-6 py-2 text-sm bg-gradient-to-r from-primary to-secondary text-white rounded-lg flex gap-2 items-center">
              <Tag className="h-4 w-4" /> Categories
            </button>
          </Link>
          <button className="px-6 py-2 text-sm bg-gradient-to-r from-primary to-secondary text-white rounded-lg flex gap-2 items-center">
            <Plus className="h-4 w-4" /> Add Gallery
          </button>
        </div>
      </div>

      <div className="mt-6">
        <Table
          columns={columns}
          data={formattedData}
          loading={loading}
          actions={actions}
          onDelete={handleDeleteClick}
        />
      </div>

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        loading={deleting}
        title="Delete Gallery"
        description={`Are you sure you want to delete "${
          selectedGallery?.title || ""
        }"?`}
      />
    </div>
  );
};

export default Page;
