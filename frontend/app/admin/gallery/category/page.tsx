"use client";

import React, { useEffect, useState } from "react";
import InputField from "@/components/layout/InputField";
import Table from "@/components/layout/Table";
import { Tag } from "lucide-react";

const CategoryPage = () => {
  const API = `${process.env.NEXT_PUBLIC_API_URL}/admin/gallery-categories`;

  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    id: null as number | null,
    name: "",
  });

  // Get token
  const getToken = () => localStorage.getItem("token");

  // Fetch Categories
  const fetchCategories = async () => {
    try {
      setLoading(true);

      const res = await fetch(API, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const data = await res.json();
      setCategories(data);
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
              { key: "id", label: "ID" },
              { key: "name", label: "Category Name" },
            ]}
            data={categories}
            loading={loading}
            actions={["edit", "delete"]}
            onEdit={handleEdit}
            onDelete={handleDelete}
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
