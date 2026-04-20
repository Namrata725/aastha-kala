"use client";

import React, { useEffect, useState } from "react";
import InputField from "@/components/layout/InputField";
import Table from "@/components/layout/Table";
import { Tag, ArrowLeft } from "lucide-react";
import { Pagination } from "@/components/global/Pagination";
import toast from "react-hot-toast";
import Link from "next/link";

const CategoryPage = () => {
  const API = `${process.env.NEXT_PUBLIC_API_URL}/admin/gallery-categories`;

  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    id: null as number | null,
    name: "",
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  // Get token
  const getToken = () => localStorage.getItem("token");

  // Fetch Categories
  const fetchCategories = async (page: number = 1) => {
    try {
      setLoading(true);

      const res = await fetch(`${API}?page=${page}`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const result = await res.json();
      
      // Handle empty page
      const items = Array.isArray(result) ? result : (result.data || []);
      if (items.length === 0 && page > 1) {
          fetchCategories(page - 1);
          return;
      }

      if (Array.isArray(result)) {
        setCategories(result);
        setPagination({ ...pagination, totalItems: result.length, itemsPerPage: result.length });
      } else if (result.data) {
        setCategories(result.data);
        setPagination({
          currentPage: result.current_page || page,
          totalPages: result.last_page || 1,
          totalItems: result.total || result.data.length,
          itemsPerPage: result.per_page || 10,
        });
      }

    } catch (error: any) {
      console.error("Fetch error:", error);
      toast.error(error.message || "Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle Input
  const handleChange = (e: any) => {
    setForm({ ...form, name: e.target.value });
  };

  // CREATE / UPDATE
  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      setIsSubmitting(true);
      const method = form.id ? "PUT" : "POST";
      const url = form.id ? `${API}/${form.id}` : API;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ name: form.name }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Something went wrong");
      }

      toast.success(form.id ? "Category updated successfully" : "Category added successfully");

      // reset form
      setForm({ id: null, name: "" });

      // refresh
      fetchCategories(pagination.currentPage);
    } catch (error: any) {
      console.error("Save error:", error);
      toast.error(error.message || "Failed to save category");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit
  const handleEdit = (row: any) => {
    setForm({
      id: row.id,
      name: row.name,
    });
  };

  // Delete
  const handleDelete = async (row: any) => {
    if (!confirm("Delete this category?")) return;

    try {
      const res = await fetch(`${API}/${row.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.message || "Failed to delete");
      }

      toast.success("Category deleted successfully");
      fetchCategories(pagination.currentPage);
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error(error.message || "Failed to delete category");
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 p-4 lg:p-6">
        <Link 
          href="/admin/gallery" 
          className="p-2 bg-white border border-gray-200 rounded-xl text-primary hover:bg-primary hover:text-white transition-all shadow-sm cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <span className="text-xl lg:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
          Gallery Categories
        </span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4 lg:p-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-sm transition duration-500">
          <Table
            columns={[
              { key: "sn", label: "SN" },
              { key: "name", label: "Category Name" },
            ]}
            data={categories.map((c, i) => ({ ...c, sn: (pagination.currentPage - 1) * pagination.itemsPerPage + i + 1 }))}
            loading={loading}
            actions={["edit", "delete"]}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            itemsPerPage={pagination.itemsPerPage}
            onPageChange={(page) => {
              fetchCategories(page);
            }}
          />
        </div>

        <div className="bg-primary/10 p-6 rounded-xl border border-primary/20 h-fit">
          <h2 className="flex items-center gap-1 font-bold bg-clip-text py-4 text-transparent bg-gradient-to-r from-primary to-secondary">
            <Tag className=" text-purple-800 h-4 w-4" />
            {form.id ? (isSubmitting ? "Updating..." : "Edit Category") : (isSubmitting ? "Adding..." : "Add Category")}
          </h2>

          <InputField
            label="Category Name"
            value={form.name}
            onChange={handleChange}
            disabled={isSubmitting}
            required
          />

          {/* SUBMIT */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`mt-4 w-full py-2 bg-gradient-to-r from-primary to-secondary rounded-lg text-white font-semibold flex items-center justify-center gap-2 ${
              isSubmitting ? "opacity-70 cursor-not-allowed" : "cursor-pointer hover:scale-[1.02] transition-transform active:scale-95"
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {form.id ? "Updating..." : "Adding..."}
              </>
            ) : (
              form.id ? "Update Category" : "Add Category"
            )}
          </button>

          {/* CANCEL */}
          {form.id && (
            <button
              onClick={() => setForm({ id: null, name: "" })}
              disabled={isSubmitting}
              className={`mt-2 w-full py-2 border border-black/10 rounded-lg text-black hover:bg-black/5 transition-all font-semibold ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              Cancel Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
