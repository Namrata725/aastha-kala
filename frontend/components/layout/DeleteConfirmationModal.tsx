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
      className="fixed inset-0 z-[150] flex items-center justify-center bg-black/10 backdrop-blur-sm cursor-pointer"
    >
      {/* Modal container with gradient border */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="p-[1px] rounded-2xl bg-gray-400/20 w-full max-w-md cursor-default shadow-2xl"
      >
        <div className="rounded-2xl bg-white/50 backdrop-blur-xl border border-white/20 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-gray-50/50">
            <h2 className="text-gray-900 font-bold uppercase italic tracking-tight">{title}</h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-200 transition-all text-gray-500 hover:text-black"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="px-5 py-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-red-500/10 border border-red-500/20">
                <Trash2 className="w-6 h-6 text-red-400" />
              </div>
            </div>

            <p className="text-gray-700 text-base font-bold leading-relaxed">{description}</p>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-5 py-4 border-t border-gray-100 bg-gray-50/30">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-xl text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all active:scale-95"
            >
              Cancel
            </button>

            <button
              onClick={onConfirm}
              disabled={loading}
              className="px-6 py-2 rounded-xl text-sm font-black uppercase tracking-widest text-white bg-gradient-to-r from-red-500 to-red-600 hover:shadow-lg hover:shadow-red-500/30 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? "Deleting..." : "Delete Permanently"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
