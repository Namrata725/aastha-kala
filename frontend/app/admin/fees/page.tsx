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
    currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 10,
  });

  const [summary, setSummary] = useState({
    total_collected: 0,
    total_pending: 0,
    paid_count: 0,
    pending_count: 0
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
        cache: "no-store"
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

      if (result.summary) {
        setSummary(result.summary);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchFees();
  }, [statusFilter, typeFilter, studentIdParam, searchTerm]);

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

      // If this was the last item on the page → go to previous page
      const isLastItemOnPage = fees.length === 1;
      if (isLastItemOnPage && pagination.currentPage > 1) {
        fetchFees(pagination.currentPage - 1);
      } else {
        fetchFees(pagination.currentPage);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setDeleting(false);
    }
  };

  const formattedData = React.useMemo(() => fees.map((fee, index) => ({
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
  })), [fees, pagination.currentPage, pagination.itemsPerPage]);

  return (
    <div className="max-w-7xl mx-auto space-y-5">

      <header className="flex flex-col lg:flex-row justify-between items-center p-6 bg-white border border-gray-200 rounded-3xl gap-6 shadow-sm">
        <div className="flex flex-col text-center lg:text-left">
          <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
            Fees & Billing
          </h1>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-widest mt-1">Manage student payments and billing records</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-64 group">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
            <input
              type="text"
              placeholder="Search student or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-2xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-purple-500/20 transition shadow-inner"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="px-4 py-3 text-sm bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-purple-500/20 transition shadow-inner cursor-pointer font-bold"
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <button
            onClick={() => { setFeeToEdit(null); setFeeModalOpen(true); }}
            className="px-6 py-3 text-sm bg-secondary text-white rounded-2xl shadow-lg shadow-secondary/20 hover:bg-black active:scale-95 flex items-center gap-2 transition-all font-bold whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Record Payment
          </button>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Collected</p>
            <p className="text-xl font-black text-gray-900 mt-1">Rs. {summary.total_collected.toLocaleString()}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-success" />
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pending</p>
            <p className="text-xl font-black text-orange-500 mt-1">Rs. {summary.total_pending.toLocaleString()}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
            <TrendingDown className="w-5 h-5 text-warning" />
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Paid Entries</p>
            <p className="text-xl font-black text-emerald-600 mt-1">{summary.paid_count}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-success" />
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Unpaid</p>
            <p className="text-xl font-black text-amber-500 mt-1">{summary.pending_count}</p>
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
        onSuccess={() => {
          if (searchTerm === "" && statusFilter === "all" && typeFilter === "all") {
            fetchFees(pagination.currentPage);
          } else {
            setSearchTerm("");
            setStatusFilter("all");
            setTypeFilter("all");
            // useEffect will trigger fetchFees()
          }
        }}
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
