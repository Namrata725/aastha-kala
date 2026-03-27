"use client";

import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import Table from "@/components/layout/Table";
import DeleteConfirmationModal from "@/components/layout/DeleteConfirmationModal";
import { Plus, Tag } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import GalleryAddEditModal from "@/components/admin/GalleryAddEditModal";
import GalleryViewModal from "@/components/admin/GalleryViewModal";
import { Pagination } from "@/components/global/Pagination";
import { getYouTubeId } from "@/utils/url";

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
  const [searchTerm, setSearchTerm] = useState("");

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
  const IMAGE_BASE = process.env.NEXT_PUBLIC_IMAGE_URL;

  const getImageUrl = (path?: string | null) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `${IMAGE_BASE?.replace(/\/$/, "")}/${path.replace(/^\/+/, "")}`;
  };

  const columns = [
    { key: "sn", label: "SN" },
    { key: "preview", label: "Preview" },
    { key: "title", label: "Title" },
    { key: "type", label: "Type" },
    { key: "category", label: "Category" },
    { key: "position", label: "Position" },
  ];

  const fetchGalleries = async (page: number = 1) => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const res = await fetch(`${BASE_URL}/admin/galleries?page=${page}`, {
        headers: {
          Accept: "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Failed to fetch galleries");
      }

      // Handle both paginated and non-paginated responses
      const galleryData = result.data?.data || result.data || [];
      
      // If the current page is empty and it's not the first page, go back one page
      if (galleryData.length === 0 && page > 1) {
        fetchGalleries(page - 1);
        return;
      }

      setGalleries(galleryData);
      
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

      const result = await res.json();
      setCategories(result.data || result || []);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchGalleries();
    fetchCategories();
  }, []);

  const filteredGalleries = galleries.filter((item) =>
    (item.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.type || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.category?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.position || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formattedData = filteredGalleries.map((item, index) => ({
    ...item,
    sn: (pagination.currentPage - 1) * pagination.itemsPerPage + index + 1,
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
            src={getImageUrl(item.images[0])}
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

      // Refresh the current page to sync pagination state
      fetchGalleries(pagination.currentPage);
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
      <div className="flex flex-col lg:flex-row justify-between items-center p-6 bg-white border border-gray-200 rounded-2xl gap-6 shadow-sm mt-4 mb-6">
        {/* Left group: Title + Search */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 flex-1 min-w-0">
          <div className="flex flex-col text-center lg:text-left shrink-0">
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              Gallery
            </span>
            <span className="text-xs text-gray-500 font-medium uppercase tracking-widest mt-0.5">Manage photos and videos</span>
          </div>
          <div className="relative flex-1 lg:w-80 lg:flex-none min-w-0">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search title, type, category or position..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl px-10 py-2.5 text-sm text-black focus:outline-none focus:border-primary transition shadow-sm"
            />
          </div>
        </div>
        {/* Right group: Buttons (Categories + Add Gallery rightmost) */}
        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
          <Link href="/admin/gallery/category">
            <button className="px-6 py-2 text-sm bg-gradient-to-r from-primary to-secondary text-white rounded-lg flex gap-2 items-center flex-1 sm:flex-none">
              <Tag className="h-4 w-4" /> Categories
            </button>
          </Link>
          <button
            onClick={handleAddClick}
            className="px-6 py-2 text-sm bg-gradient-to-r from-primary to-secondary text-white rounded-lg flex gap-2 items-center flex-1 sm:flex-none"
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
          onPageChange={(page) => fetchGalleries(page)}
        />
      </div>

      <GalleryAddEditModal
        key={editData ? editData.id : "new"}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          setSearchTerm("");
          fetchGalleries();
        }}
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
