"use client";

import React from "react";
import { X, User, Mail, Phone, Calendar } from "lucide-react";

interface Message {
  id: number;
  full_name: string;
  email: string;
  phone_number: string;
  message: string;
  created_at: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  message: Message | null;
}

const MessageViewModal: React.FC<Props> = ({ isOpen, onClose, message }) => {
  if (!isOpen || !message) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div
        className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            Message Details
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Sender Name
              </label>
              <div className="flex items-center gap-2 text-gray-800 dark:text-gray-200 font-medium">
                <User className="w-4 h-4 text-primary/60" />
                {message.full_name}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Received Date
              </label>
              <div className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                <Calendar className="w-4 h-4 text-primary/60" />
                {new Date(message.created_at).toLocaleString()}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Email Address
              </label>
              <div className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                <Mail className="w-4 h-4 text-primary/60" />
                {message.email}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Phone Number
              </label>
              <div className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                <Phone className="w-4 h-4 text-primary/60" />
                {message.phone_number || "N/A"}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Message Content
            </label>
            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed border border-gray-100 dark:border-gray-800 italic">
              "{message.message}"
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-primary text-white rounded-xl font-bold hover:opacity-90 transition shadow-md"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageViewModal;
