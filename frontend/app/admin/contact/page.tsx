"use client";

import React, { useEffect, useState } from "react";
import Table from "@/components/layout/Table";
import DeleteConfirmationModal from "@/components/layout/DeleteConfirmationModal";
import MessageViewModal from "@/components/admin/MessageViewModal";
import toast from "react-hot-toast";
import { Pagination } from "@/components/global/Pagination";

interface Message {
  id: number;
  full_name: string;
  email: string;
  phone_number: string;
  message: string;
  created_at: string;
}

const AdminMessagesPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  
  // Modals for Delete
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedMessageForDelete, setSelectedMessageForDelete] = useState<Message | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Modal for View
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedMessageForView, setSelectedMessageForView] = useState<Message | null>(null);

  const columns = [
    { key: "sn", label: "SN" },
    { key: "full_name", label: "Full Name" },
    { key: "email", label: "Email" },
    { key: "phone_number", label: "Phone" },
    { key: "message_preview", label: "Message" },
    { key: "date", label: "Date" },
  ];

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/messages`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const result = await response.json();

      if (response.ok) {
        setMessages(result.data?.data || result.data || []);
        
        if (result.data?.last_page) {
            setPagination({
                currentPage: result.data.current_page,
                totalPages: result.data.last_page,
                totalItems: result.data.total,
                itemsPerPage: result.data.per_page,
            });
        }
      } else {
        toast.error("Failed to fetch messages.");
      }
    } catch (error) {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const formattedData = messages.map((msg, index) => ({
    ...msg,
    sn: index + 1,
    message_preview: (
      <div className="max-w-[200px] truncate" title={msg.message}>
        {msg.message}
      </div>
    ),
    date: new Date(msg.created_at).toLocaleDateString(),
  }));

  const handleViewClick = (row: any) => {
    const original = messages.find((m) => m.id === row.id);
    setSelectedMessageForView(original || null);
    setViewModalOpen(true);
  };

  const handleDeleteClick = (row: any) => {
    const original = messages.find((m) => m.id === row.id);
    setSelectedMessageForDelete(original || null);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedMessageForDelete) return;

    setDeleting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/messages/${selectedMessageForDelete.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (response.ok) {
        toast.success("Message deleted successfully.");
        setMessages((prev) => prev.filter((msg) => msg.id !== selectedMessageForDelete.id));
      } else {
        toast.error("Failed to delete message.");
      }
    } catch (error) {
      toast.error("Something went wrong.");
    } finally {
      setDeleting(false);
      setDeleteModalOpen(false);
      setSelectedMessageForDelete(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-10">
      <div className="flex items-center justify-between p-4">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
          Contact Us Messages
        </h1>
        <div className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
          {messages.length} total
        </div>
      </div>

      <div className="mt-4">
        <Table
          columns={columns}
          data={formattedData}
          loading={loading}
          actions={["view", "delete"]}
          onView={handleViewClick}
          onDelete={handleDeleteClick}
          emptyMessage="No messages found"
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
                        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/messages?page=${p}`, {
                            headers: {
                                Authorization: `Bearer ${token}`,
                                Accept: "application/json",
                            },
                        });
                        const result = await res.json();
                        setMessages(result.data?.data || []);
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

      <MessageViewModal
        isOpen={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedMessageForView(null);
        }}
        message={selectedMessageForView}
      />

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        loading={deleting}
        title="Delete Message"
        description={`Are you sure you want to delete the message from "${
          selectedMessageForDelete?.full_name || ""
        }"?`}
      />
    </div>
  );
};

export default AdminMessagesPage;
