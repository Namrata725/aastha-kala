"use client";

import React, { useEffect, useState } from "react";
import Table from "@/components/layout/Table";
import DeleteConfirmationModal from "@/components/layout/DeleteConfirmationModal";
import { Plus, Tag } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import GalleryAddEditModal from "@/components/admin/GalleryAddEditModal";
import GalleryViewModal from "@/components/admin/GalleryViewModal";
import { Pagination } from "@/components/global/Pagination";

interface Gallery {
  id: number;
  title: string;
  type: string;
  position?: string;
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

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedGallery, setSelectedGallery] = useState<Gallery | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewData, setViewData] = useState<Gallery | null>(null);

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

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

      const token = localStorage.getItem("token");

      const res = await fetch(`${BASE_URL}/admin/galleries`, {
        headers: {
          Accept: "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Failed to fetch galleries");
      }

      setGalleries(result.data?.data || result.data || []);
      
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

  const handleViewClick = (row: any) => {
    const original = galleries.find((g) => g.id === row.id);
    setViewData(original || null);
    setViewModalOpen(true);
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${BASE_URL}/admin/gallery-categories`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      const data = await res.json();
      setCategories(data || []);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchGalleries();
    fetchCategories();
  }, []);

  const getYouTubeId = (url: string) => {
    try {
      const parsed = new URL(url);

      if (parsed.hostname.includes("youtu.be")) {
        return parsed.pathname.slice(1);
      }

      if (parsed.searchParams.get("v")) {
        return parsed.searchParams.get("v");
      }

      return null;
    } catch {
      return null;
    }
  };

  const formattedData = galleries.map((item, index) => ({
    ...item,
    sn: index + 1,
    category: item.category?.name || "N/A",

    preview:
      item.type === "video" && item.video ? (
        (() => {
          const videoId = getYouTubeId(item.video);

          return videoId ? (
            <img
              src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
              className="w-16 h-10 object-cover rounded"
              alt="video thumbnail"
            />
          ) : (
            <span className="text-white/50 text-xs">Invalid Video</span>
          );
        })()
      ) : item.images && item.images.length > 0 ? (
        <div className="relative w-10 h-10">
          <img
            src={item.images[0]}
            className="w-10 h-10 object-cover rounded"
            alt="preview"
          />

          {item.images.length > 1 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white text-xs font-semibold rounded">
              +{item.images.length - 1}
            </div>
          )}
        </div>
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
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${BASE_URL}/admin/galleries/${selectedGallery.id}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            Authorization: token ? `Bearer ${token}` : "",
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

  const handleEditClick = (row: any) => {
    const original = galleries.find((g) => g.id === row.id);
    setEditData(original);
    setModalOpen(true);
  };

  const handleAddClick = () => {
    setEditData(null);
    setModalOpen(true);
  };

  const actions: ("view" | "edit" | "delete")[] = ["view", "edit", "delete"];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between p-4">
        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
          Gallery
        </span>

        <div className="flex gap-2">
          <Link href="/admin/gallery/category">
            <button className="px-6 py-2 text-sm bg-gradient-to-r from-primary to-secondary text-white rounded-lg flex gap-2 items-center">
              <Tag className="h-4 w-4" /> Categories
            </button>
          </Link>

          <button
            onClick={handleAddClick}
            className="px-6 py-2 text-sm bg-gradient-to-r from-primary to-secondary text-white rounded-lg flex gap-2 items-center"
          >
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
          onView={handleViewClick}
          onEdit={handleEditClick}
          emptyMessage="No gallery items found"
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
                        const token = localStorage.getItem("token");
                        const res = await fetch(`${BASE_URL}/admin/galleries?page=${p}`, {
                            headers: {
                                Accept: "application/json",
                                Authorization: token ? `Bearer ${token}` : "",
                            },
                        });
                        const result = await res.json();
                        setGalleries(result.data?.data || []);
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

      <GalleryAddEditModal
        key={editData ? editData.id : "new"}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchGalleries}
        editData={editData}
        categories={categories}
      />

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

      <GalleryViewModal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        data={viewData || undefined}
      />
    </div>
  );
};

export default Page;
