"use client";

import React from "react";
import { X, Trash2 } from "lucide-react";

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  loading?: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete Confirmation",
  description = "Are you sure you want to delete this item? This action cannot be undone.",
  loading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm cursor-pointer"
    >
      {/* Modal container with gradient border */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="p-[1px] rounded-2xl bg-gradient-to-r from-primary/10 to-secondary/10 w-full max-w-md cursor-default"
      >
        <div className="rounded-2xl bg-primary/10 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-gradient-to-r from-primary/20 to-secondary/20">
            <h2 className="text-white font-semibold">{title}</h2>
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-white/10 transition"
            >
              <X className="w-5 h-5 text-white/70" />
            </button>
          </div>

          {/* Body */}
          <div className="px-5 py-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-red-500/10 border border-red-500/20">
                <Trash2 className="w-6 h-6 text-red-400" />
              </div>
            </div>

            <p className="text-primary/70 text-lg font-bold">{description}</p>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-5 py-4 border-t border-white/10 bg-white/5">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm text-white/80 bg-white/5 hover:bg-white/10 border border-white/10 transition"
            >
              Cancel
            </button>

            <button
              onClick={onConfirm}
              disabled={loading}
              className="px-4 py-2 rounded-lg text-sm text-white bg-gradient-to-r from-red-500 to-red-600 hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
