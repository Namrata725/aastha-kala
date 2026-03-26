"use client";

import React, { useEffect, useState } from "react";
import Table from "@/components/layout/Table";
import DeleteConfirmationModal from "@/components/layout/DeleteConfirmationModal";
import { Plus, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";
import EventAddEditModal from "@/components/admin/EventAddEditModal";
import EventViewModal from "@/components/admin/EventViewModal";
import { Pagination } from "@/components/global/Pagination";

interface Event {
  id: number;
  title: string;
  slug: string;
  description?: string;
  event_date: string;
  location: string;
  status: "draft" | "published";
  banner?: string;
  created_at?: string;
  contact_person_name?: string;
  contact_person_phone?: string;
}

const Page = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  // View modal state
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewEvent, setViewEvent] = useState<Event | null>(null);

  // Table columns
  const columns = [
    { key: "sn", label: "SN" },
    { key: "banner", label: "Banner" },
    { key: "title", label: "Title" },
    { key: "event_date", label: "Event Date" },
    { key: "location", label: "Location" },
    { key: "status", label: "Status" },
  ];

  // Fetch events
  const fetchEvents = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/events`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Failed to fetch events");
      }

      setEvents(result.data?.data || result.data || []);
      
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
    fetchEvents();
  }, []);

  // Format data for table
  const formattedData = events.map((event, index) => ({
    ...event,
    sn: index + 1,

    banner: event.banner ? (
      <img
        src={event.banner}
        alt={event.title}
        className="w-12 h-12 object-cover rounded"
      />
    ) : (
      <div className="w-12 h-12 flex items-center justify-center bg-white/10 rounded">
        <ImageIcon className="w-5 h-5 text-white/60" />
      </div>
    ),

    status: (
      <span
        className={`px-2 py-1 rounded text-xs ${
          event.status === "published"
            ? "bg-green-500/20 text-black"
            : "bg-yellow-500/20 text-black"
        }`}
      >
        {event.status}
      </span>
    ),

    event_date: new Date(event.event_date).toLocaleString(),
  }));

  // View handler
  const handleView = (row: any) => {
    const original = events.find((e) => e.id === row.id);
    setViewEvent(original || null);
    setViewModalOpen(true);
  };

  // Edit handler
  const handleEdit = (row: any) => {
    const original = events.find((e) => e.id === row.id);
    setEditingEvent(original || null);
    setFormModalOpen(true);
  };

  // Delete handler
  const handleDeleteClick = (row: any) => {
    const original = events.find((e) => e.id === row.id);
    setSelectedEvent(original || null);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedEvent) return;

    setDeleting(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/events/${selectedEvent.id}`,
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

      toast.success("Event deleted");

      setEvents((prev) => prev.filter((e) => e.id !== selectedEvent.id));
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setDeleting(false);
      setDeleteModalOpen(false);
      setSelectedEvent(null);
    }
  };

  const actions: ("view" | "edit" | "delete")[] = ["view", "edit", "delete"];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between p-4">
        <span className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-primary to-secondary">
          Events
        </span>

        <button
          onClick={() => {
            setEditingEvent(null);
            setFormModalOpen(true);
          }}
          className="px-6 py-2 text-sm bg-linear-to-r from-primary to-secondary text-white rounded-lg flex gap-2 items-center cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Add Event
        </button>
      </div>

      {/* Table */}
      <div className="mt-6">
        <Table
          columns={columns}
          data={formattedData}
          loading={loading}
          actions={actions}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          emptyMessage="No events found"
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
                        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/events?page=${p}`, {
                            headers: {
                                Accept: "application/json",
                                Authorization: `Bearer ${localStorage.getItem("token")}`,
                            },
                        });
                        const result = await res.json();
                        setEvents(result.data?.data || []);
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

      {/* Add/Edit Modal */}
      <EventAddEditModal
        isOpen={formModalOpen}
        onClose={() => {
          setFormModalOpen(false);
          setEditingEvent(null);
        }}
        event={editingEvent}
        onSuccess={fetchEvents}
      />

      {/* View Modal */}
      <EventViewModal
        isOpen={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setViewEvent(null);
        }}
        event={viewEvent}
      />

      {/* Delete Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        loading={deleting}
        title="Delete Event"
        description={`Are you sure you want to delete "${
          selectedEvent?.title || ""
        }"? This action cannot be undone.`}
      />
    </div>
  );
};

export default Page;
