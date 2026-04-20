"use client";

import React, { useEffect, useState } from "react";
import Table from "@/components/layout/Table";
import DeleteConfirmationModal from "@/components/layout/DeleteConfirmationModal";
import { Plus, GripVertical, Pencil, Trash2, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";
import DressHireModal from "@/components/admin/DressHireModal";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Dress {
  id: number;
  title: string;
  order: number;
  images: string[];
}

const SortableRow = ({
  dress,
  index,
  onEdit,
  onDelete,
}: {
  dress: Dress;
  index: number;
  onEdit: (dress: Dress) => void;
  onDelete: (dress: Dress) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: dress.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
    opacity: isDragging ? 0.8 : 1,
    position: (isDragging ? "relative" : "static") as any,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`border-t border-gray-100 hover:bg-gray-400/5 transition duration-200 ${
        isDragging ? "bg-white shadow-xl ring-1 ring-primary/20" : ""
      }`}
    >
      <td className="px-4 py-3">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-primary transition-colors p-1"
        >
          <GripVertical size={18} />
        </button>
      </td>
      <td className="px-4 py-3 text-sm text-gray-800 font-medium">
        {index + 1}
      </td>
      <td className="px-4 py-3">
        {dress.images?.length ? (
          <div className="relative w-10 h-10">
            <img
              src={dress.images[0]}
              alt={dress.title}
              className="w-10 h-10 object-cover rounded-lg border border-gray-200"
            />
            {dress.images.length > 1 && (
              <div className="absolute -top-1.5 -right-1.5 bg-black text-white text-[10px] px-1 py-0.5 rounded-full shadow-sm leading-none">
                +{dress.images.length - 1}
              </div>
            )}
          </div>
        ) : (
          <div className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-100">
            <ImageIcon className="w-4 h-4 text-gray-300" />
          </div>
        )}
      </td>
      <td className="px-4 py-3 text-sm text-gray-800 font-bold whitespace-nowrap">
        {dress.title}
      </td>
      <td className="px-4 py-3">
        <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-1 rounded-md">
          #{dress.order}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="p-[1px] rounded-lg bg-gradient-to-r from-primary/30 to-secondary/30">
            <button
              onClick={() => onEdit(dress)}
              className="flex items-center justify-center w-7 h-7 rounded-lg bg-white/80 hover:bg-white backdrop-blur-md border border-white/20 hover:scale-105 active:scale-95 transition duration-200 cursor-pointer text-orange-500 shadow-sm"
            >
              <Pencil size={14} />
            </button>
          </div>
          <div className="p-[1px] rounded-lg bg-gradient-to-r from-primary/30 to-secondary/30">
            <button
              onClick={() => onDelete(dress)}
              className="flex items-center justify-center w-7 h-7 rounded-lg bg-white/80 hover:bg-white backdrop-blur-md border border-white/20 hover:scale-105 active:scale-95 transition duration-200 cursor-pointer text-red-500 shadow-sm"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </td>
    </tr>
  );
};

const Page = () => {
  const [dresses, setDresses] = useState<Dress[]>([]);
  const [loading, setLoading] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = dresses.findIndex((d) => d.id === active.id);
      const newIndex = dresses.findIndex((d) => d.id === over.id);

      const newDresses = arrayMove(dresses, oldIndex, newIndex);
      
      // Update the order property locally for immediate feedback
      const updatedDresses = newDresses.map((d, index) => ({
        ...d,
        order: index + 1,
      }));

      setDresses(updatedDresses);

      // Persist to backend
      try {
        const orders = updatedDresses.map((d) => ({
          id: d.id,
          order: d.order,
        }));

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/dress-hire/reorder`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ orders }),
        });

        if (!res.ok) throw new Error("Synchronization failed");
        toast.success("Order updated");
      } catch (err: any) {
        toast.error("Failed to sync new order");
        fetchDresses(); // Revert
      }
    }
  };

  const handleEdit = (dress: Dress) => {
    setEditingDress(dress);
    setFormModalOpen(true);
  };

  const handleDeleteClick = (dress: Dress) => {
    setSelectedDress(dress);
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
    <div className="space-y-6">
      {/* header */}
      <div className="flex flex-col lg:flex-row justify-between items-center p-4 lg:p-6 bg-white border border-gray-100 rounded-2xl gap-6 shadow-sm mb-8">
        <div className="flex flex-col text-center lg:text-left">
          <h2 className="text-xl lg:text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            Dress Hire Management
          </h2>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-widest mt-1">
            Drag and drop rows to reorder dress hierarchy
          </p>
        </div>

        <button
          onClick={() => {
            setEditingDress(null);
            setFormModalOpen(true);
          }}
          className="w-full lg:w-auto px-6 py-2.5 bg-gradient-to-r from-primary to-secondary text-white rounded-xl flex gap-2 items-center justify-center font-bold shadow-lg hover:scale-105 transition-all cursor-pointer active:scale-95 text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add New</span>
        </button>
      </div>

      {/* table */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="p-[1px] rounded-2xl bg-gray-400/10 backdrop-blur-sm shadow-xl overflow-hidden">
          <div className="rounded-2xl bg-white border border-gray-100 overflow-x-auto shadow-sm custom-scrollbar">
            <table className="w-full border-collapse min-w-[600px] lg:min-w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="w-10 px-4 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-500"></th>
                  <th className="w-12 px-4 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-500">SN</th>
                  <th className="w-20 px-4 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-500">Preview</th>
                  <th className="px-4 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-500">Title</th>
                  <th className="w-24 px-4 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-500">Order</th>
                  <th className="w-24 px-4 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  Array.from({ length: 3 }).map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                       <td colSpan={6} className="px-4 py-4"><div className="h-10 bg-gray-50 rounded-xl" /></td>
                    </tr>
                  ))
                ) : (
                  <SortableContext
                    items={dresses.map((d) => d.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {dresses.map((dress, index) => (
                      <SortableRow
                        key={dress.id}
                        dress={dress}
                        index={index}
                        onEdit={handleEdit}
                        onDelete={handleDeleteClick}
                      />
                    ))}
                  </SortableContext>
                )}
              </tbody>
            </table>
            {!loading && dresses.length === 0 && (
              <div className="py-20 text-center">
                 <p className="text-gray-400 font-medium">No dresses found. Add your first dress hire entry!</p>
              </div>
            )}
          </div>
        </div>
      </DndContext>

      {/* add/edit modal */}
      <DressHireModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSuccess={fetchDresses}
        dress={editingDress}
        existingOrders={dresses.map(d => d.order)}
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
