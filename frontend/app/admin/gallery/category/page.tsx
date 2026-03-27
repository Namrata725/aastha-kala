"use client";

import React, { useEffect, useState } from "react";
import InputField from "@/components/layout/InputField";
import Table from "@/components/layout/Table";
import { Tag } from "lucide-react";
import { Pagination } from "@/components/global/Pagination";

const CategoryPage = () => {
  const API = `${process.env.NEXT_PUBLIC_API_URL}/admin/gallery-categories`;

  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

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

    } catch (error) {
      console.error("Fetch error:", error);
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
    if (!form.name.trim()) return;

    try {
      const method = form.id ? "PUT" : "POST";
      const url = form.id ? `${API}/${form.id}` : API;

      await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ name: form.name }),
      });

      // reset form
      setForm({ id: null, name: "" });

      // refresh
      fetchCategories();
    } catch (error) {
      console.error("Save error:", error);
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
      await fetch(`${API}/${row.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      fetchCategories();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  return (
    <div>
      <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary p-6">
        Gallery Categories
      </span>
      <div className="grid grid-cols-2 gap-6 p-6 max-w-7xl mx-auto">
        <div>
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
          <h2 className="flex  items-center gap-1 font-bold bg-clip-text py-4 text-transparent bg-gradient-to-r from-primary to-secondary ">
            <Tag className=" text-purple-800 h-4 w-4" />
            {form.id ? "Edit Category" : "Add Category"}
          </h2>

          <InputField
            label="Category Name"
            value={form.name}
            onChange={handleChange}
          />

          {/* SUBMIT */}
          <button
            onClick={handleSubmit}
            className="mt-4 w-full py-2 bg-gradient-to-r from-primary to-secondary rounded-lg text-white font-semibold"
          >
            {form.id ? "Update Category" : "Add Category"}
          </button>

          {/* CANCEL */}
          {form.id && (
            <button
              onClick={() => setForm({ id: null, name: "" })}
              className="mt-2 w-full py-2 border border-white/20 rounded-lg text-white"
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
