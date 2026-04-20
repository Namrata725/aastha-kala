"use client";

import React, { useEffect, useState } from "react";
import { Search, Plus, User, Phone, MapPin, GraduationCap, CreditCard } from "lucide-react";
import { useRouter } from "next/navigation";
import Table from "@/components/layout/Table";
import DeleteConfirmationModal from "@/components/layout/DeleteConfirmationModal";
import toast from "react-hot-toast";
import { Pagination } from "@/components/global/Pagination";
import StudentAddEditModal from "@/components/admin/StudentAddEditModal";
import StudentViewModal from "@/components/admin/StudentViewModal";
import ProgramManagementView from "@/components/admin/ProgramManagementView";

interface Student {
  id: number;
  name: string;
  phone: string;
  email?: string;
  dob?: string;
  address?: string;
  status: "active" | "inactive" | "graduated";
  image?: string;
  image_url?: string;
  gender?: string;
  classes?: string;
}

const StudentPage = () => {
    const router = useRouter();
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "graduated">("all");
    const [viewMode, setViewMode] = useState<"students" | "programs">("students");
  
    const [pagination, setPagination] = useState({
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      itemsPerPage: 10,
    });
  
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [deleting, setDeleting] = useState(false);
  
    const [formModalOpen, setFormModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [viewStudent, setViewStudent] = useState<Student | null>(null);
  
    const columns = [
      { key: "sn", label: "SN" },
      { key: "image", label: "Photo" },
      { key: "name", label: "Name" },
      { key: "phone", label: "Phone" },
      { key: "status", label: "Status" },
    ];
  
    const fetchStudents = async (page: number = 1) => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/students?page=${page}&search=${searchTerm}&status=${statusFilter === 'all' ? '' : statusFilter}`,
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );
  
        const result = await res.json();
        if (!res.ok) throw new Error(result.message || "Failed to fetch students");
  
        setStudents(result.data.data);
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
  
    useEffect(() => {
      setLoading(true);
      fetchStudents();
    }, [searchTerm, statusFilter]);
  
    const formattedData = React.useMemo(() => students.map((student, index) => ({
      ...student,
      sn: (pagination.currentPage - 1) * pagination.itemsPerPage + index + 1,
      image: student.image_url ? (
        <img src={student.image_url} alt={student.name} className="w-10 h-10 object-cover rounded-full border border-gray-200" />
      ) : (
        <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full">
          <User className="w-5 h-5 text-gray-400" />
        </div>
      ),
      status: (
        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
          student.status === 'active' ? 'bg-green-100 text-green-700' : 
          student.status === 'inactive' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
        }`}>
          {student.status}
        </span>
      ),
    })), [students, pagination.currentPage, pagination.itemsPerPage]);
  
    const handleEdit = (row: any) => {
      const original = students.find(s => s.id === row.id);
      setEditingStudent(original || row);
      setFormModalOpen(true);
    };
  
    const handleView = (row: any) => {
      const original = students.find(s => s.id === row.id);
      setViewStudent(original || row);
      setViewModalOpen(true);
    };
  
    const handleDeleteClick = (row: any) => {
      const original = students.find(s => s.id === row.id);
      setSelectedStudent(original || row);
      setDeleteModalOpen(true);
    };
  
    const confirmDelete = async () => {
      if (!selectedStudent) return;
      setDeleting(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/students/${selectedStudent.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Delete failed");
        toast.success("Student deleted");

          // If this was the last item on the page → go to previous page
          const isLastItemOnPage = students.length === 1;

          if (isLastItemOnPage && pagination.currentPage > 1) {
            fetchStudents(pagination.currentPage - 1);
          } else {
            fetchStudents(pagination.currentPage);
          }
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        setDeleting(false);
        setDeleteModalOpen(false);
      }
    };
  
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex flex-col lg:flex-row justify-between items-center p-4 lg:p-6 bg-white border border-gray-200 rounded-2xl lg:rounded-3xl gap-6 shadow-sm">
          <div className="flex flex-col text-center lg:text-left w-full lg:w-auto items-center lg:items-start">
            <h1 className="text-xl lg:text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              Student Management
            </h1>
            <div className="flex bg-slate-100 p-1 rounded-2xl mt-3 w-fit overflow-x-auto max-w-full">
                <button 
                    onClick={() => setViewMode("students")}
                    className={`px-4 lg:px-6 py-1.5 text-[10px] lg:text-xs font-black rounded-xl transition-all whitespace-nowrap ${viewMode === "students" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                >STUDENT LIST</button>
                <button 
                    onClick={() => setViewMode("programs")}
                    className={`px-4 lg:px-6 py-1.5 text-[10px] lg:text-xs font-black rounded-xl transition-all whitespace-nowrap ${viewMode === "programs" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                >PROGRAM VIEW</button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search name..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-2xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 transition shadow-inner"
              />
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select 
                value={statusFilter}
                onChange={(e: any) => setStatusFilter(e.target.value)}
                className="flex-1 sm:flex-none px-4 py-3 text-sm bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 transition shadow-inner cursor-pointer"
              >
                <option value="all">Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="graduated">Graduated</option>
              </select>
              <button
                onClick={() => { setEditingStudent(null); setFormModalOpen(true); }}
                className="flex-1 sm:flex-none px-6 py-3 text-sm bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200 hover:bg-black active:scale-95 flex items-center justify-center gap-2 transition-all font-bold whitespace-nowrap"
              >
                <Plus className="h-4 w-4" />
                <span>Add</span>
              </button>
            </div>
          </div>
        </header>
  
        {viewMode === "students" ? (
            <div className="overflow-hidden">
                <Table
                    columns={columns}
                    data={formattedData}
                    loading={loading}
                    actions={["view", "edit", "delete"]}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                    customActions={[
                    {
                        icon: <CreditCard className="w-4 h-4" />,
                        label: "Fees & Billing",
                        onClick: (row) => router.push(`/admin/fees?student_id=${row.id}`),
                        color: "text-blue-600"
                    }
                    ]}
                />
                <div className="p-4 border-gray-100">
                    <Pagination
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    totalItems={pagination.totalItems}
                    itemsPerPage={pagination.itemsPerPage}
                    onPageChange={(page) => fetchStudents(page)}
                    />
                </div>
            </div>
        ) : (
            <ProgramManagementView 
              searchTerm={searchTerm} 
              statusFilter={statusFilter} 
              onRefresh={() => fetchStudents(pagination.currentPage)} 
            />
        )}

        <StudentAddEditModal
          isOpen={formModalOpen}
          onClose={() => { setFormModalOpen(false); setEditingStudent(null); }}
          student={editingStudent}
          onSuccess={() => {
            if (searchTerm === "" && statusFilter === "all") {
              fetchStudents();
            } else {
              setSearchTerm("");
              setStatusFilter("all");
              // The useEffect will trigger fetchStudents()
            }
          }}
        />

        <StudentViewModal
          isOpen={viewModalOpen}
          onClose={() => { setViewModalOpen(false); setViewStudent(null); }}
          student={viewStudent}
        />

        <DeleteConfirmationModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          loading={deleting}
          title="Delete Student"
          description={`Are you sure you want to delete "${selectedStudent?.name}"? All records including fees will be lost.`}
        />
      </div>
    );
};

export default StudentPage;
