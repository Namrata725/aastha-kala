"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  X, Search, Receipt, CheckCircle2, Sparkles,
  ChevronDown, User, CreditCard, BookOpen, Clock,
} from "lucide-react";
import toast from "react-hot-toast";

/* ─── Types ──────────────────────────────────────────────── */
interface Student {
  id: number;
  name: string;
  classes?: string;
}

interface ProgramFees {
  program_titles: string[];
  programs_breakdown?: {
    id: number;
    title: string;
    admission_fee: number;
    program_fee: number;
  }[];
  enrolled_count?: number;
  matched_count?: number;
  admission_fee: number | null;
  program_fee: number | null;
}

interface ProgramFeeEntry {
  id: number;
  title: string;
  base: number;
  discount: number;
  discountType: "cash" | "percentage";
  paid: string;
  paidAdd?: string; // for edit mode
  initialPaid?: number; // for edit mode
}

interface FeeInfo {
  student: { id: number; name: string; classes?: string };
  admission_paid: boolean;
  admission_exists: boolean;
  admission_amount: number | null;
  program_fees: ProgramFees | null;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  fee?: any;
}

/* ─── Helpers ────────────────────────────────────────────── */
function calcNet(base: number, discount: number, type: "cash" | "percentage"): number {
  if (!discount || discount <= 0) return base;
  if (type === "percentage") return Math.max(0, base - (base * Math.min(discount, 100)) / 100);
  return Math.max(0, base - discount);
}

function fmt(n: number) {
  return "Rs." + Math.round(n).toLocaleString();
}

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function getCurrentPeriod() {
  const d = new Date();
  return `${d.getDate()} ${d.toLocaleString("en-US", { month: "long" })} ${d.getFullYear()}`;
}

/* ─── DiscountField ──────────────────────────────────────── */
const DiscountField: React.FC<{
  discountType: "cash" | "percentage";
  onTypeChange: (t: "cash" | "percentage") => void;
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
  baseIsZero?: boolean;
}> = ({ discountType, onTypeChange, value, onChange, disabled, baseIsZero }) => (
  <div className="flex border border-gray-200 rounded-lg overflow-hidden bg-white">
    <div className="flex flex-shrink-0 border-r border-gray-200">
      <button
        type="button"
        disabled={disabled || baseIsZero}
        onClick={() => onTypeChange("cash")}
        className={`px-3 py-2 text-xs font-medium transition-colors disabled:opacity-40 ${
          discountType === "cash"
            ? "bg-gray-900 text-white"
            : "text-gray-500 hover:bg-gray-50"
        }`}
      >
        Rs
      </button>
      <button
        type="button"
        disabled={disabled || baseIsZero}
        onClick={() => onTypeChange("percentage")}
        className={`px-3 py-2 text-xs font-medium transition-colors border-l border-gray-200 disabled:opacity-40 ${
          discountType === "percentage"
            ? "bg-gray-900 text-white"
            : "text-gray-500 hover:bg-gray-50"
        }`}
      >
        %
      </button>
    </div>
    <input
      type="number"
      min={0}
      max={discountType === "percentage" ? 100 : undefined}
      value={value || ""}
      onChange={(e) => {
        const v = Number(e.target.value);
        if (v >= 0) onChange(v);
      }}
      disabled={disabled || baseIsZero}
      placeholder={discountType === "percentage" ? "0–100" : "Amount"}
      className="flex-1 min-w-0 px-3 py-2 text-sm text-primary outline-none disabled:opacity-40 bg-transparent placeholder:text-gray-300"
    />
  </div>
);

/* ─── MiniStat ───────────────────────────────────────────── */
const MiniStat: React.FC<{ label: string; value: string; highlight?: "due" | "clear" }> = ({
  label, value, highlight,
}) => (
  <div
    className={`text-right rounded-lg px-4 py-2 min-w-[90px] flex-shrink-0 ${
      highlight === "due"
        ? "bg-warning/10 border border-warning/20"
        : highlight === "clear"
        ? "bg-success/10 border border-success/20"
        : "bg-gray-50 border border-gray-100"
    }`}
  >
    <p className="text-[10px] uppercase tracking-widest font-medium text-gray-400 leading-none mb-1">
      {label}
    </p>
    <p
      className={`text-base font-semibold leading-none ${
        highlight === "due"
          ? "text-warning"
          : highlight === "clear"
          ? "text-success"
          : "text-primary"
      }`}
    >
      {value}
    </p>
  </div>
);

/* ─── SectionHeader ──────────────────────────────────────── */
const SectionHeader: React.FC<{
  step: number;
  title: string;
  badge?: string;
  right?: React.ReactNode;
}> = ({ step, title, badge, right }) => (
  <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-gray-100">
    <span className="w-5 h-5 rounded-full bg-gray-900 text-white flex items-center justify-center text-[11px] font-medium flex-shrink-0">
      {step}
    </span>
    <span className="text-xs font-medium text-gray-400 uppercase tracking-widest">{title}</span>
    {badge && (
      <span className="ml-1 text-[11px] text-gray-400 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full">
        {badge}
      </span>
    )}
    {right && <div className="ml-auto">{right}</div>}
  </div>
);

/* ─── Card ───────────────────────────────────────────────── */
const Card: React.FC<{ children: React.ReactNode; muted?: boolean; className?: string }> = ({
  children, muted, className = "",
}) => (
  <div
    className={`bg-white border border-gray-200 rounded-xl p-5 ${muted ? "opacity-70" : ""} ${className}`}
  >
    {children}
  </div>
);

/* ─── Label ──────────────────────────────────────────────── */
const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-widest mb-1.5">
    {children}
  </label>
);

/* ─── FieldInput ─────────────────────────────────────────── */
const FieldInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input
    {...props}
    className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 bg-white placeholder:text-gray-400 disabled:opacity-50 disabled:bg-gray-100 transition-colors ${props.className ?? ""}`}
  />
);

/* ─── Main Modal ──────────────────────────────────────────── */
const FeeAddModal: React.FC<Props> = ({ isOpen, onClose, onSuccess, fee }) => {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
  const dropdownRef = useRef<HTMLDivElement>(null);

  /* students */
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [feeInfo, setFeeInfo] = useState<FeeInfo | null>(null);
  const [loadingFeeInfo, setLoadingFeeInfo] = useState(false);

  /* admission fee */
  const [admBase, setAdmBase] = useState("");
  const [admDisc, setAdmDisc] = useState(0);
  const [admDiscType, setAdmDiscType] = useState<"cash" | "percentage">("cash");
  const [admPaid, setAdmPaid] = useState("");

  /* program fee */
  const [progEntries, setProgEntries] = useState<ProgramFeeEntry[]>([]);
  const [progPeriod, setProgPeriod] = useState(getCurrentPeriod());
  const [progBase, setProgBase] = useState("");
  const [progDisc, setProgDisc] = useState(0);
  const [progDiscType, setProgDiscType] = useState<"cash" | "percentage">("cash");
  const [progPaid, setProgPaid] = useState("");

  /* addition during edit */
  const [admAdd, setAdmAdd] = useState("");
  const [progAdd, setProgAdd] = useState("");
  const [initialAdmPaid, setInitialAdmPaid] = useState(0);
  const [initialProgPaid, setInitialProgPaid] = useState(0);

  /* meta */
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  /* derived */
  const admissionInHistory = feeInfo?.admission_exists ?? false;
  const admissionPaidStatus = feeInfo?.admission_paid ?? false;
  const admBaseNum = Number(admBase) || 0;
  const admNet = calcNet(admBaseNum, admDisc, admDiscType);
  const admPaidNum = fee ? (initialAdmPaid + (Number(admAdd) || 0)) : (Number(admPaid) || 0);
  const admDue = Math.max(0, admNet - admPaidNum);
  const admSaved = admBaseNum - admNet;

  const progBaseNum = fee ? (Number(progBase) || 0) : progEntries.reduce((acc, curr) => acc + (Number(curr.base) || 0), 0);
  const progNet = fee 
    ? calcNet(progBaseNum, progDisc, progDiscType)
    : progEntries.reduce((acc, curr) => acc + calcNet(curr.base, curr.discount, curr.discountType), 0);
  const progPaidNum = fee 
    ? (initialProgPaid + (Number(progAdd) || 0)) 
    : progEntries.reduce((acc, curr) => acc + (Number(curr.paid) || 0), 0);
  const progDue = Math.max(0, progNet - progPaidNum);
  const progSaved = fee 
    ? (progBaseNum - progNet)
    : progEntries.reduce((acc, curr) => acc + (curr.base - calcNet(curr.base, curr.discount, curr.discountType)), 0);

  const hasAdm = admBaseNum > 0;
  const hasProg = progBaseNum > 0;

  const grandTotal = (hasAdm ? admNet : 0) + (hasProg ? progNet : 0);
  const grandCollected = (hasAdm ? admPaidNum : 0) + (hasProg ? progPaidNum : 0);
  const grandDue = Math.max(0, grandTotal - grandCollected);

  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  /* close dropdown on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* on open */
  useEffect(() => {
    if (!isOpen) return;
    fetchStudents();
    setErrors({});
    if (fee) {
      setSelectedStudentId(fee.student_id?.toString() ?? "");
      setSelectedStudent(fee.student ?? null);
      setSearchQuery(fee.student?.name ?? "");
      setProgPeriod(fee.month_year ?? "");
      setPaymentMethod(fee.payment_method ?? "Cash");
      setRemarks(fee.remarks ?? "");
      
      const type = fee.fee_type;
      const totalPaid = Number(fee.paid_amount) || 0;
      
      if (type === "admission") {
        setAdmBase(fee.admission_fee?.toString() ?? fee.total_amount?.toString() ?? "");
        setAdmDisc(Number(fee.admission_discount) || 0);
        setAdmDiscType(fee.admission_discount_type ?? "cash");
        setAdmPaid(totalPaid.toString());
        setInitialAdmPaid(totalPaid);
        setAdmAdd("");
        setProgBase(""); setProgDisc(0); setProgPaid(""); setInitialProgPaid(0); setProgAdd("");
      } else if (type === "program") {
        setProgBase(fee.program_fee?.toString() ?? fee.total_amount?.toString() ?? "");
        setProgDisc(Number(fee.program_discount) || 0);
        setProgDiscType(fee.program_discount_type ?? "cash");
        setProgPaid(totalPaid.toString());
        setInitialProgPaid(totalPaid);
        setProgAdd("");
        setAdmBase(""); setAdmDisc(0); setAdmPaid(""); setInitialAdmPaid(0); setAdmAdd("");
      } else {
        setAdmBase(fee.admission_fee?.toString() ?? "");
        setAdmDisc(Number(fee.admission_discount) || 0);
        setAdmDiscType(fee.admission_discount_type ?? "cash");
        setProgBase(fee.program_fee?.toString() ?? "");
        setProgDisc(Number(fee.program_discount) || 0);
        setProgDiscType(fee.program_discount_type ?? "cash");
        
        const admBaseCalc = Number(fee.admission_fee) || 0;
        const admDiscCalc = Number(fee.admission_discount) || 0;
        const admNetCalc = calcNet(admBaseCalc, admDiscCalc, fee.admission_discount_type ?? "cash");
        
        const progBaseCalc = Number(fee.program_fee) || 0;
        const progDiscCalc = Number(fee.program_discount) || 0;
        const progNetCalc = calcNet(progBaseCalc, progDiscCalc, fee.program_discount_type ?? "cash");

        if (fee.admission_paid) {
            setAdmPaid(admNetCalc.toString());
            setInitialAdmPaid(admNetCalc);
            setProgPaid(Math.max(0, totalPaid - admNetCalc).toString());
            setInitialProgPaid(Math.max(0, totalPaid - admNetCalc));
        } else {
            const admAlloc = Math.min(totalPaid, admNetCalc);
            setAdmPaid(admAlloc.toString());
            setInitialAdmPaid(admAlloc);
            setProgPaid(Math.max(0, totalPaid - admAlloc).toString());
            setInitialProgPaid(Math.max(0, totalPaid - admAlloc));
        }
        setAdmAdd(""); setProgAdd("");
        setProgEntries([]);
      }
    } else {
      resetForm();
    }
  }, [isOpen, fee]);

  const updateProgEntry = (id: number, field: keyof ProgramFeeEntry, value: any) => {
    setProgEntries(prev => prev.map(entry => 
      entry.id === id ? { ...entry, [field]: value } : entry
    ));
  };

  const resetForm = () => {
    setSelectedStudentId(""); setSelectedStudent(null); setSearchQuery("");
    setFeeInfo(null);
    setAdmBase(""); setAdmPaid(""); setAdmDisc(0); setAdmDiscType("cash");
    setProgEntries([]);
    setProgPeriod(getCurrentPeriod());
    setPaymentMethod("Cash"); setRemarks("");
  };

  const fetchStudents = async () => {
    try {
      setLoadingStudents(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/admin/students?per_page=1000`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setStudents(data.data?.data || data.data || []);
    } catch {
      toast.error("Failed to load students");
    } finally {
      setLoadingStudents(false);
    }
  };

  const fetchFeeInfo = useCallback(
    async (studentId: string) => {
      if (!studentId) return;
      try {
        setLoadingFeeInfo(true);
        const token = localStorage.getItem("token");
        const res = await fetch(`${BASE_URL}/admin/students/${studentId}/fee-info`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setFeeInfo(data.data);
          if (data.data?.program_fees) {
            const pf = data.data.program_fees;
            // Only suggest admission fee if it doesn't exist in history
            if (pf.admission_fee !== null && pf.admission_fee !== undefined && !data.data.admission_exists) {
              setAdmBase(pf.admission_fee.toString());
            } else {
              setAdmBase(""); // Clear it if it exists or is null
            }
            if (pf.program_fee !== null && pf.program_fee !== undefined) {
              setProgBase(pf.program_fee.toString());
            }
            if (pf.programs_breakdown) {
              setProgEntries(pf.programs_breakdown.map((pb: any) => ({
                id: pb.id,
                title: pb.title,
                base: pb.program_fee,
                discount: 0,
                discountType: "cash",
                paid: pb.program_fee.toString()
              })));
            }
          }
        }
      } catch {}
      finally {
        setLoadingFeeInfo(false);
      }
    },
    [BASE_URL]
  );

  const handleSelectStudent = (student: Student) => {
    setSelectedStudentId(student.id.toString());
    setSelectedStudent(student);
    setSearchQuery(student.name);
    setDropdownOpen(false);
    fetchFeeInfo(student.id.toString());
  };

  const handleSubmit = async () => {
    if (!selectedStudentId) { toast.error("Please select a student"); return; }
    if (!hasAdm && !hasProg) { toast.error("Enter at least one fee amount"); return; }

    const totalAmount = (hasAdm ? admNet : 0) + (hasProg ? progNet : 0);
    const totalPaid = (hasAdm ? admPaidNum : 0) + (hasProg ? progPaidNum : 0);
    const pendingAmount = Math.max(0, totalAmount - totalPaid);
    const feeType = hasAdm && hasProg ? "billing" : hasAdm ? "admission" : "program";

    try {
      setLoading(true); setErrors({});
      const token = localStorage.getItem("token")!;
      const url = fee
        ? `${BASE_URL}/admin/student-fees/${fee.id}`
        : `${BASE_URL}/admin/student-fees`;
      const payload: any = {
        student_id: selectedStudentId, fee_type: feeType,
        month_year: progPeriod || getCurrentPeriod(), total_amount: totalAmount,
        paid_amount: totalPaid, pending_amount: pendingAmount,
        payment_method: paymentMethod,
        remarks: remarks ||
          `${feeType === "billing" ? "Admission + Program Fee" : feeType === "admission" ? "Admission Fee" : "Program Fee"} — ${progPeriod || getCurrentPeriod()}`,
        ...(hasAdm && {
          admission_fee: admBaseNum, admission_discount: admDisc,
          admission_discount_type: admDiscType, admission_paid: admPaidNum >= admNet,
        }),
        ...(hasProg && {
          program_fee: progBaseNum, 
          program_discount: progDisc,
          program_discount_type: progDiscType,
          selected_programs: progEntries.map(e => e.id),
          program_payments: progEntries.reduce((acc, curr) => ({ ...acc, [curr.id]: Number(curr.paid) || 0 }), {}),
          program_discounts: progEntries.reduce((acc, curr) => ({ 
            ...acc, 
            [curr.id]: { amount: curr.discount, type: curr.discountType } 
          }), {}),
        }),
      };
      const res = await fetch(url, {
        method: fee ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok) {
        if (result.errors) {
          setErrors(result.errors);
          toast.error((Object.values(result.errors)[0] as string[])[0] ?? "Validation failed");
        } else throw new Error(result.message ?? "Something went wrong");
        return;
      }
      toast.success(fee ? "Payment record updated!" : "Payment recorded successfully!");
      resetForm(); onSuccess(); onClose();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-[100] overflow-y-auto">
      <div
        className="bg-gray-50 w-full max-w-5xl min-h-screen shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
              <Receipt className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-primary leading-none">
                {fee ? "Edit Payment Record" : "New Payment"}
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">Admission &amp; program fees</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 flex gap-0">
          {/* Left: Form */}
          <div className="flex-1 px-6 py-6 space-y-4 overflow-y-auto">

            {/* ── 1. Student ── */}
            <Card>
              <SectionHeader step={1} title="Student" />

              {selectedStudent && !dropdownOpen ? (
                <>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-medium text-primary flex-shrink-0">
                      {initials(selectedStudent.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-primary leading-none">
                        {selectedStudent.name}
                      </p>
                      {selectedStudent.classes && (
                        <p className="text-xs text-gray-400 mt-0.5">{selectedStudent.classes}</p>
                      )}
                    </div>
                    {loadingFeeInfo && (
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                    )}
                    {!fee && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedStudent(null);
                          setSelectedStudentId("");
                          setFeeInfo(null);
                          setSearchQuery("");
                          setDropdownOpen(true);
                        }}
                        className="text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-2.5 py-1.5 transition-colors"
                      >
                        Change
                      </button>
                    )}
                  </div>

                  {feeInfo?.program_fees && (
                    <div className="mt-3 flex flex-col gap-2 p-3 bg-gray-50 border border-gray-100 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-success" />
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none">
                            Enrolled Programs Breakdown
                          </p>
                        </div>
                        {feeInfo.program_fees.enrolled_count !== undefined && 
                         feeInfo.program_fees.matched_count !== undefined && 
                         feeInfo.program_fees.matched_count < feeInfo.program_fees.enrolled_count && (
                          <span className="text-[10px] text-red-500 font-bold bg-red-50 px-1.5 py-0.5 rounded border border-red-100 uppercase">
                            Missing {feeInfo.program_fees.enrolled_count - feeInfo.program_fees.matched_count} Program(s)
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-1.5 mt-1">
                        {feeInfo.program_fees.programs_breakdown?.map((pb, idx) => (
                           <div key={idx} className="flex items-center justify-between bg-white border border-gray-100 px-3 py-2 rounded-md">
                             <span className="text-sm font-semibold text-primary">{pb.title}</span>
                             <div className="flex gap-4 text-right">
                                <div>
                                  <span className="text-[9px] text-gray-400 font-medium uppercase block leading-none mb-0.5">Adm.</span>
                                  <span className="text-xs font-semibold text-primary">{fmt(pb.admission_fee)}</span>
                                </div>
                                <div>
                                  <span className="text-[9px] text-gray-400 font-medium uppercase block leading-none mb-0.5">Fee</span>
                                  <span className="text-xs font-semibold text-primary">{fmt(pb.program_fee)}</span>
                                </div>
                             </div>
                           </div>
                        ))}
                      </div>

                      <div className="flex justify-end gap-5 mt-2 pt-2 border-t border-gray-200">
                        <div className="text-right">
                          <p className="text-[10px] text-gray-400 font-bold uppercase leading-none mb-1">Max Adm.</p>
                          <p className="text-sm font-black text-gray-900">
                            {feeInfo.program_fees.admission_fee != null
                              ? fmt(feeInfo.program_fees.admission_fee)
                              : "—"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-gray-400 font-bold uppercase leading-none mb-1">Total Fee</p>
                          <p className="text-sm font-black text-gray-900">
                            {feeInfo.program_fees.program_fee != null
                              ? fmt(feeInfo.program_fees.program_fee)
                              : "—"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div ref={dropdownRef} className="relative">
                  <div
                    className={`flex items-center gap-2 border rounded-lg px-3 py-2.5 bg-white ${
                      errors.student_id ? "border-red-300" : "border-gray-200 focus-within:border-gray-400"
                    }`}
                  >
                    <Search className="w-4 h-4 text-gray-300 flex-shrink-0" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setSelectedStudentId("");
                        setFeeInfo(null);
                        setDropdownOpen(true);
                      }}
                      onFocus={() => !fee && setDropdownOpen(true)}
                      placeholder={loadingStudents ? "Loading students…" : "Search by student name…"}
                      className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder:text-gray-300"
                      disabled={!!fee || loadingStudents}
                    />
                    {loadingFeeInfo && (
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                    )}
                  </div>

                  {dropdownOpen && !fee && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-52 overflow-y-auto">
                      {filteredStudents.length > 0 ? (
                        filteredStudents.map((s) => (
                          <button
                            key={s.id}
                            onClick={() => handleSelectStudent(s)}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center justify-between border-b border-gray-50 last:border-0"
                          >
                            <div>
                              <span className="text-sm font-medium text-gray-800 block">{s.name}</span>
                              {s.classes && (
                                <span className="text-xs text-gray-400">{s.classes}</span>
                              )}
                            </div>
                            <span className="text-xs text-gray-300">#{s.id}</span>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-6 text-center text-sm text-gray-400">
                          No students found
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </Card>

            {/* ── 2. Admission Fee ── */}
            <Card muted={admissionInHistory && !fee}>
              <SectionHeader
                step={2}
                title="Admission fee"
                badge="One-time"
                right={
                  admissionInHistory ? (
                    <div className={`flex items-center gap-1.5 border px-2.5 py-1 rounded-full ${
                      admissionPaidStatus 
                        ? "bg-success/10 border-success/20 text-success" 
                        : "bg-warning/10 border-warning/20 text-warning"
                    }`}>
                      {admissionPaidStatus ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      <span className="text-[11px] font-medium">
                        {admissionPaidStatus ? "Paid in History" : "Pending in History"} 
                        {feeInfo?.admission_amount ? ` — ${fmt(Number(feeInfo.admission_amount))}` : ""}
                      </span>
                    </div>
                  ) : null
                }
              />

              {admissionInHistory && !fee ? (
                <div className="space-y-4">
                  <p className="text-xs text-gray-400 text-center py-3 bg-gray-50 rounded-lg">
                    Admission fee record already exists for this student. Use "Edit" on the previous record if you need to adjust it, or proceed with Monthly fee below.
                  </p>
                  <div className="flex justify-center">
                    <button 
                      type="button"
                      onClick={() => setAdmBase("0")}
                      className="text-xs text-gray-500 hover:text-gray-900 underline"
                    >
                      Clear admission from this transaction
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Fee amount</Label>
                      <FieldInput
                        type="number" min={0} value={admBase}
                        onChange={(e) => { if (Number(e.target.value) >= 0) setAdmBase(e.target.value); }}
                        placeholder="0" disabled={loading}
                      />
                    </div>
                    <div>
                      <Label>Discount</Label>
                      <DiscountField
                        discountType={admDiscType} onTypeChange={setAdmDiscType}
                        value={admDisc} onChange={setAdmDisc}
                        disabled={loading} baseIsZero={admBaseNum === 0}
                      />
                      {admSaved > 0 && (
                        <p className="text-[11px] text-success font-medium mt-1.5">
                          Saving {fmt(admSaved)}
                        </p>
                      )}
                    </div>
                  </div>

                  {admBaseNum > 0 && (
                    <div className="flex items-end gap-3 mt-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-[11px] font-bold text-gray-600 uppercase tracking-widest">
                            {fee ? "Payment update" : "Amount paid"}
                          </label>
                          {admDue > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                if (fee) {
                                  setAdmAdd((admNet - initialAdmPaid).toString());
                                } else {
                                  setAdmPaid(admNet.toString());
                                }
                              }}
                              className="text-[10px] font-bold text-secondary hover:text-secondary/80 uppercase tracking-widest transition-colors"
                            >
                              Clear Due
                            </button>
                          )}
                        </div>
                        
                        {fee ? (
                          <div className="flex items-center gap-2">
                            <div className="flex-1">
                              <p className="text-[9px] text-gray-400 uppercase mb-1">Already Paid</p>
                              <FieldInput
                                value={fmt(initialAdmPaid)}
                                disabled
                                className="bg-gray-50 border-gray-200 text-gray-400 font-medium"
                              />
                            </div>
                            <div className="text-gray-300 mt-4">+</div>
                            <div className="flex-1">
                              <p className="text-[9px] text-secondary font-bold uppercase mb-1">Add Payment</p>
                              <FieldInput
                                type="number" min={0} max={admNet - initialAdmPaid} value={admAdd}
                                onChange={(e) => { if (Number(e.target.value) >= 0) setAdmAdd(e.target.value); }}
                                placeholder="0" disabled={loading}
                                className="border-secondary/30 focus:border-secondary focus:ring-secondary/10"
                              />
                            </div>
                          </div>
                        ) : (
                          <FieldInput
                            type="number" min={0} max={admNet} value={admPaid}
                            onChange={(e) => { if (Number(e.target.value) >= 0) setAdmPaid(e.target.value); }}
                            placeholder="0" disabled={loading}
                          />
                        )}
                      </div>
                      <MiniStat label="Net" value={fmt(admNet)} />
                      <MiniStat
                        label="Due" value={fmt(admDue)}
                        highlight={admDue > 0 ? "due" : "clear"}
                      />
                    </div>
                  )}
                </>
              )}
            </Card>

            {/* ── 3. Program Fee ── */}
            <Card>
              <SectionHeader step={3} title="Program fee" badge="Recurring" />
              
              <div className="mb-5 max-w-sm">
                <Label>Fee Period</Label>
                <div className="relative">
                  <FieldInput
                    type="text" value={progPeriod}
                    onChange={(e) => setProgPeriod(e.target.value)}
                    placeholder="e.g. April 2026" disabled={loading}
                    className="pl-9"
                  />
                  <Clock className="w-4 h-4 text-gray-300 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {!fee && progEntries.length > 0 ? (
                <div className="space-y-4">
                  {progEntries.map((pe) => {
                    const entryNet = calcNet(pe.base, pe.discount, pe.discountType);
                    const entryDue = Math.max(0, entryNet - (Number(pe.paid) || 0));
                    
                    return (
                      <div key={pe.id} className="p-4 bg-gray-50 border border-gray-100 rounded-xl space-y-4">
                        <div className="flex items-center justify-between border-b border-gray-200/50 pb-2">
                           <div className="flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-secondary"></div>
                             <span className="text-sm font-bold text-primary">{pe.title}</span>
                           </div>
                           <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Individual Program Billing</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Base Fee</Label>
                            <FieldInput
                              type="number" min={0} value={pe.base}
                              onChange={(e) => updateProgEntry(pe.id, "base", Number(e.target.value))}
                              placeholder="0" disabled={loading}
                            />
                          </div>
                          <div>
                            <Label>Discount</Label>
                            <DiscountField
                              discountType={pe.discountType} 
                              onTypeChange={(t) => updateProgEntry(pe.id, "discountType", t)}
                              value={pe.discount} 
                              onChange={(v) => updateProgEntry(pe.id, "discount", v)}
                              disabled={loading} baseIsZero={pe.base === 0}
                            />
                          </div>
                        </div>

                          <div className="flex items-end gap-3 pt-1">
                          <div className="flex-1">
                             <div className="flex items-center justify-between mb-1.5">
                                <Label>Amount Paid</Label>
                                {entryDue > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => updateProgEntry(pe.id, "paid", entryNet.toString())}
                                    className="text-[10px] font-bold text-secondary hover:text-secondary/80 uppercase tracking-widest transition-colors mb-1.5"
                                  >
                                    Clear Due
                                  </button>
                                )}
                             </div>
                             <FieldInput
                                type="number" min={0} max={entryNet} value={pe.paid}
                                onChange={(e) => updateProgEntry(pe.id, "paid", e.target.value)}
                                placeholder="0" disabled={loading}
                             />
                          </div>
                          <div className="flex items-end gap-2">
                            <MiniStat label="Net" value={fmt(entryNet)} />
                            <MiniStat
                              label="Due" value={fmt(entryDue)}
                              highlight={entryDue > 0 ? "due" : "clear"}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between shadow-sm">
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Total Program Bill</p>
                      <p className="text-sm text-gray-600 font-medium">Sum of all enrolled programs for this period</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-400 font-bold uppercase leading-none mb-1">Grand Program Net</p>
                      <p className="text-xl font-black text-gray-900">{fmt(progNet)}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {fee?.program && (
                    <div className="mb-4 p-3 bg-secondary/5 border border-secondary/10 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Target Program</p>
                        <p className="text-sm font-bold text-primary">{fee.program.title}</p>
                      </div>
                      <BookOpen className="w-5 h-5 text-secondary opacity-30" />
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Fee amount</Label>
                      <FieldInput
                        type="number" min={0} value={progBase}
                        onChange={(e) => { if (Number(e.target.value) >= 0) setProgBase(e.target.value); }}
                        placeholder="0" disabled={loading}
                      />
                    </div>
                    <div>
                      <Label>Discount</Label>
                      <DiscountField
                        discountType={progDiscType} onTypeChange={setProgDiscType}
                        value={progDisc} onChange={setProgDisc}
                        disabled={loading} baseIsZero={progBaseNum === 0}
                      />
                      {progSaved > 0 && (
                        <p className="text-[11px] text-success font-medium mt-1.5">
                          Saving {fmt(progSaved)}
                        </p>
                      )}
                    </div>
                  </div>

                  {progBaseNum > 0 && (
                    <div className="flex items-end gap-3 mt-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-[11px] font-bold text-gray-600 uppercase tracking-widest">
                            {fee ? "Payment update" : "Amount paid"}
                          </label>
                          {progDue > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                if (fee) {
                                  setProgAdd((progNet - initialProgPaid).toString());
                                } else {
                                  setProgPaid(progNet.toString());
                                }
                              }}
                              className="text-[10px] font-bold text-secondary hover:text-secondary/80 uppercase tracking-widest transition-colors"
                            >
                              Clear Due
                            </button>
                          )}
                        </div>

                        {fee ? (
                          <div className="flex items-center gap-2">
                            <div className="flex-1">
                              <p className="text-[9px] text-gray-400 uppercase mb-1">Already Paid</p>
                              <FieldInput
                                value={fmt(initialProgPaid)}
                                disabled
                                className="bg-gray-50 border-gray-200 text-gray-400 font-medium"
                              />
                            </div>
                            <div className="text-gray-300 mt-4">+</div>
                            <div className="flex-1">
                              <p className="text-[9px] text-secondary font-bold uppercase mb-1">Add Payment</p>
                              <FieldInput
                                type="number" min={0} max={progNet - initialProgPaid} value={progAdd}
                                onChange={(e) => { if (Number(e.target.value) >= 0) setProgAdd(e.target.value); }}
                                placeholder="0" disabled={loading}
                                className="border-secondary/30 focus:border-secondary focus:ring-secondary/10"
                              />
                            </div>
                          </div>
                        ) : (
                          <FieldInput
                            type="number" min={0} max={progNet} value={progPaid}
                            onChange={(e) => { if (Number(e.target.value) >= 0) setProgPaid(e.target.value); }}
                            placeholder="0" disabled={loading}
                          />
                        )}
                      </div>
                      <MiniStat label="Net" value={fmt(progNet)} />
                      <MiniStat
                        label="Due" value={fmt(progDue)}
                        highlight={progDue > 0 ? "due" : "clear"}
                      />
                    </div>
                  )}
                </>
              )}
            </Card>

            {/* ── 4. Payment Details ── */}
            <Card>
              <SectionHeader step={4} title="Payment details" />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Method</Label>
                  <div className="relative">
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      disabled={loading}
                      className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-2 text-sm text-primary bg-white outline-none focus:border-gray-400 disabled:opacity-50 pr-8"
                    >
                      <option>Cash</option>
                      <option>Bank Transfer</option>
                      <option>Digital Wallet</option>
                      <option>Cheque</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <Label>Remarks</Label>
                  <FieldInput
                    type="text" value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Optional note…" disabled={loading}
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* ── Right: Summary panel ── */}
          <div className="w-72 flex-shrink-0 border-l border-gray-200 bg-white px-5 py-6 flex flex-col gap-6 sticky top-[61px] self-start h-[calc(100vh-61px)] overflow-y-auto">

            {/* Student quick info */}
            {selectedStudent && (
              <div>
                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-3">
                  Student
                </p>
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-medium text-primary flex-shrink-0">
                    {initials(selectedStudent.name)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-primary leading-none">{selectedStudent.name}</p>
                    {selectedStudent.classes && (
                      <p className="text-xs text-gray-400 mt-0.5">{selectedStudent.classes}</p>
                    )}
                  </div>
                </div>
                {feeInfo?.program_fees && (
                  <div className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2.5 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{feeInfo.program_fees.program_titles?.join(", ")}</span>
                  </div>
                )}
              </div>
            )}

            {/* Summary */}
            <div className="flex-1">
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-3">
                Summary
              </p>

              {!hasAdm && !hasProg ? (
                <p className="text-xs text-gray-400 text-center py-8 border border-dashed border-gray-200 rounded-lg">
                  Enter fee amounts above to see a summary
                </p>
              ) : (
                <div className="space-y-0 border border-gray-100 rounded-xl overflow-hidden">
                  {hasAdm && (
                    <div className="flex items-start justify-between px-4 py-3 border-b border-gray-50">
                      <div>
                        <p className="text-sm text-gray-700">Admission fee</p>
                        {admSaved > 0 && (
                          <p className="text-[11px] text-success mt-0.5">−{fmt(admSaved)} discount</p>
                        )}
                      </div>
                      <p className="text-sm font-medium text-primary">{fmt(admNet)}</p>
                    </div>
                  )}
                  {hasProg && (
                    <div className="flex items-start justify-between px-4 py-3 border-b border-gray-50">
                      <div>
                        <p className="text-sm text-gray-700">Program fee</p>
                        <p className="text-xs text-gray-400 mt-0.5">{progPeriod}</p>
                        {progSaved > 0 && (
                          <p className="text-[11px] text-success mt-0.5">−{fmt(progSaved)} discount</p>
                        )}
                      </div>
                      <p className="text-sm font-medium text-primary">{fmt(progNet)}</p>
                    </div>
                  )}
                  <div className="bg-gray-900 px-4 py-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Total billed</span>
                      <span className="font-medium text-white">{fmt(grandTotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Collected</span>
                      <span className="font-medium text-success">{fmt(grandCollected)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-700">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-white">Balance due</span>
                        {grandDue > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                                // Clear overall remainder by distributing to paid fields
                                if(hasAdm) setAdmPaid(admNet.toString());
                                if(hasProg) {
                                  if (fee) {
                                    setProgAdd((progNet - initialProgPaid).toString());
                                  } else {
                                    setProgEntries(prev => prev.map(e => ({
                                      ...e,
                                      paid: calcNet(e.base, e.discount, e.discountType).toString()
                                    })));
                                    setProgPaid(progNet.toString()); // Fallback for visibility elsewhere
                                  }
                                }
                            }}
                            className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider hover:underline text-left mt-0.5"
                          >
                            Mark All Paid
                          </button>
                        )}
                      </div>
                      <span
                        className={`text-base font-semibold ${
                          grandDue > 0 ? "text-warning" : "text-success"
                        }`}
                      >
                        {fmt(grandDue)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="bg-white border-t border-gray-200 px-6 py-4 sticky bottom-0">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-sm font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <CreditCard className="w-4 h-4" />
            {loading ? "Processing…" : fee ? "Update Payment Record" : "Finalize & Record Payment"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeeAddModal;