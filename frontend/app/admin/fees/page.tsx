"use client";

import React, { useEffect, useState } from "react";
import {
  Plus, CreditCard, Calendar, DollarSign,
  TrendingUp, TrendingDown, BarChart3, Search,
  Filter
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import Table from "@/components/layout/Table";
import DeleteConfirmationModal from "@/components/layout/DeleteConfirmationModal";
import toast from "react-hot-toast";
import { Pagination } from "@/components/global/Pagination";
import FeeAddModal from "@/components/admin/FeeAddModal";
import FeeViewModal from "@/components/admin/FeeViewModal";

interface Student { id: number; name: string; }

interface StudentFee {
  id: number;
  student_id: number;
  student: Student;
  fee_type: "admission" | "program";
  month_year?: string;
  total_amount: number;
  paid_amount: number;
  pending_amount: number;
  status: "paid" | "pending";
  created_at?: string;
}

const FeesPage = () => {
  const searchParams = useSearchParams();
  const studentIdParam = searchParams.get("student_id");

  const [fees, setFees] = useState<StudentFee[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "pending">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "admission" | "program">("all");

  const [pagination, setPagination] = useState({
    currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 15,
  });

  const [searchTerm, setSearchTerm] = useState("");

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState<StudentFee | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [feeModalOpen, setFeeModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [feeToEdit, setFeeToEdit] = useState<any>(null);
  const [feeToView, setFeeToView] = useState<any>(null);

  const columns = [
    { key: "sn", label: "SN" },
    { key: "student_name", label: "Student" },
    { key: "month_year", label: "Period" },
    { key: "total_amount", label: "Total" },
    { key: "paid_amount", label: "Paid" },
    { key: "status", label: "Status" },
  ];

  const fetchFees = async (page: number = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      let url = `${process.env.NEXT_PUBLIC_API_URL}/admin/student-fees?page=${page}`;
      if (statusFilter !== "all") url += `&status=${statusFilter}`;
      if (typeFilter !== "all") url += `&fee_type=${typeFilter}`;
      if (studentIdParam) url += `&student_id=${studentIdParam}`;
      if (searchTerm) url += `&search=${searchTerm}`;

      const res = await fetch(url, {
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message ?? "Failed to fetch fees");

      setFees(result.data.data);
      setPagination({
        currentPage: result.data.current_page,
        totalPages: result.data.last_page,
        totalItems: result.data.total,
        itemsPerPage: result.data.per_page,
      });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFees(); }, [statusFilter, typeFilter, studentIdParam, searchTerm]);

  const handleDelete = async () => {
    if (!selectedFee) return;
    try {
      setDeleting(true);
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/student-fees/${selectedFee.id}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Failed to delete record");
      toast.success("Record deleted");
      setDeleteModalOpen(false);
      fetchFees(pagination.currentPage);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setDeleting(false);
    }
  };

  // Summary stats (from current page — server-side pagination)
  const totalCollected = fees.reduce((acc, f) => acc + Number(f.paid_amount), 0);
  const totalPending = fees.reduce((acc, f) => acc + Number(f.pending_amount), 0);
  const paidCount = fees.filter(f => f.status === "paid").length;
  const pendingCount = fees.filter(f => f.status === "pending").length;

  const formattedData = fees.map((fee, index) => ({
    ...fee,
    sn: (pagination.currentPage - 1) * pagination.itemsPerPage + index + 1,
    student_name: (
      <div className="flex flex-col">
        <span className="font-semibold text-gray-800 text-sm">{fee.student?.name ?? "Unknown"}</span>
        <span className="text-[10px] text-gray-400">ID #{fee.student_id}</span>
      </div>
    ),
    fee_type: (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${fee.fee_type === "admission"
          ? "bg-secondary/10 text-secondary"
          : "bg-info/10 text-info"
        }`}>
        {fee.fee_type === "admission" ? "Admission" : (fee.fee_type === "program" ? "Program" : "Billing")}
      </span>
    ),
    month_year: (
      <span className="text-xs text-gray-600 font-medium">{fee.month_year ?? "—"}</span>
    ),
    total_amount: (
      <span className="text-sm font-bold text-gray-900">Rs. {Number(fee.total_amount).toLocaleString()}</span>
    ),
    paid_amount: (
      <span className="text-sm font-bold text-success">Rs. {Number(fee.paid_amount).toLocaleString()}</span>
    ),
    status: (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${fee.status === "paid"
          ? "bg-success/10 text-success"
          : "bg-warning/10 text-warning"
        }`}>
        <span className={`w-1.5 h-1.5 rounded-full ${fee.status === "paid" ? "bg-success" : "bg-warning"}`} />
        {fee.status}
      </span>
    ),
  }));

  return (
    <div className="max-w-7xl mx-auto space-y-5">

      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Fees & Billing</h1>
          <p className="text-xs text-gray-400 font-medium mt-0.5 uppercase tracking-widest">
            Manage student payments and billing records
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
            <input
              type="text"
              placeholder="Search student..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400/30 w-full sm:w-64 transition-all shadow-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="text-xs border border-gray-200 bg-white rounded-xl px-3 py-2.5 text-gray-700 font-bold focus:outline-none focus:ring-2 focus:ring-purple-400/30 cursor-pointer shadow-sm"
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <button
            onClick={() => { setFeeToEdit(null); setFeeModalOpen(true); }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-secondary hover:bg-secondary/90 text-white text-sm font-bold rounded-xl shadow-md shadow-secondary/20 transition-all active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Record Payment
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Collected</p>
            <p className="text-xl font-black text-gray-900 mt-1">Rs. {totalCollected.toLocaleString()}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-success" />
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pending</p>
            <p className="text-xl font-black text-orange-500 mt-1">Rs. {totalPending.toLocaleString()}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
            <TrendingDown className="w-5 h-5 text-warning" />
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Paid Entries</p>
            <p className="text-xl font-black text-emerald-600 mt-1">{paidCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-success" />
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Unpaid</p>
            <p className="text-xl font-black text-amber-500 mt-1">{pendingCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-warning" />
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-gray-100">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            {pagination.totalItems} Records
          </p>
        </div>

        <Table
          columns={columns}
          data={formattedData}
          loading={loading}
          actions={["view", "edit", "delete"]}
          onView={row => { const original = fees.find(f => f.id === row.id); setFeeToView(original); setViewModalOpen(true); }}
          onEdit={row => { const original = fees.find(f => f.id === row.id); setFeeToEdit(original); setFeeModalOpen(true); }}
          onDelete={row => { const original = fees.find(f => f.id === row.id); setSelectedFee(original || null); setDeleteModalOpen(true); }}
        />

        <div className="px-6 py-4 border-gray-100">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            itemsPerPage={pagination.itemsPerPage}
            onPageChange={page => fetchFees(page)}
          />
        </div>
      </div>

      <FeeAddModal
        isOpen={feeModalOpen}
        fee={feeToEdit}
        onClose={() => setFeeModalOpen(false)}
        onSuccess={() => fetchFees(pagination.currentPage)}
      />

      <FeeViewModal
        isOpen={viewModalOpen}
        fee={feeToView}
        onClose={() => setViewModalOpen(false)}
      />

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Payment Record"
        loading={deleting}
        description={`Are you sure you want to delete the payment record for ${selectedFee?.student?.name ?? "this student"}? This cannot be undone.`}
      />
    </div>
  );
};

export default FeesPage;
