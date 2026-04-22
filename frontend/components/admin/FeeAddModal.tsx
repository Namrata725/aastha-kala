"use client";

import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
  X, Search, Receipt, CreditCard, BookOpen,
  Wallet, Calendar, MessageSquare,
  Banknote, Building, Smartphone, FileText,
  Check, User, RotateCcw, ChevronDown
} from "lucide-react";
import toast from "react-hot-toast";
import { useReactToPrint } from "react-to-print";
import { ThermalBill } from "./ThermalBill";

/* ─── Types ──────────────────────────────────────────────── */
interface Student { id: number; name: string; classes?: string }
interface ProgramFeeEntry {
  id: number; title: string; base: number;
  discount: number; discountType: "cash" | "percentage";
  payingNow: string; initialPaid?: number;
}
interface FeeInfo {
  student: { id: number; name: string; classes?: string };
  admission_paid: boolean; admission_exists: boolean;
  admission_amount: number | null; admission_paid_amount?: number;
  admission_discount?: number; admission_discount_type?: "cash" | "percentage";
  global_admission_fee?: number;
  program_fees: { programs_breakdown?: { id: number; title: string; program_fee: number; paid_amount?: number; discount?: number; discount_type?: string; status?: string }[] } | null;
  period_record?: { remarks?: string; payment_method?: string };
}
interface Props { isOpen: boolean; onClose: () => void; onSuccess: () => void; fee?: any }

/* ─── Helpers ────────────────────────────────────────────── */
function calcNet(base: number, discount: number, type: "cash" | "percentage"): number {
  if (!discount || discount <= 0) return base;
  if (type === "percentage") return Math.max(0, base - (base * Math.min(discount, 100)) / 100);
  return Math.max(0, base - discount);
}
function fmt(n: number) { return "Rs. " + Math.round(n).toLocaleString("en-IN"); }
function fmtS(n: number) { return Math.round(n).toLocaleString("en-IN"); }
function initials(name: string) { return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase(); }
function getCurrentPeriod() {
  const d = new Date();
  return `${d.getDate()} ${d.toLocaleString("en-US", { month: "long" })} ${d.getFullYear()}`;
}

/**
 * Proportionally distribute `amount` across items by their due.
 * Returns a map of id → allocated amount (capped at item.due).
 */
function distributePayment(amount: number, items: { id: string; due: number }[]): Record<string, number> {
  const totalDue = items.reduce((s, i) => s + i.due, 0);
  if (totalDue <= 0 || amount <= 0) return {};
  let remaining = Math.min(amount, totalDue); // never exceed total due
  const result: Record<string, number> = {};
  for (const item of items) {
    const share = Math.min(item.due, Math.round((item.due / totalDue) * amount));
    result[item.id] = share;
    remaining -= share;
  }
  // Fix rounding remainders
  let idx = 0;
  while (remaining > 0 && idx < items.length) {
    const item = items[idx];
    const canAdd = item.due - (result[item.id] || 0);
    if (canAdd > 0) { const add = Math.min(canAdd, remaining); result[item.id] = (result[item.id] || 0) + add; remaining -= add; }
    idx++;
  }
  return result;
}

function blockNeg(e: React.KeyboardEvent<HTMLInputElement>) { if ("eE+-".includes(e.key)) e.preventDefault(); }
function clamp(v: string): string {
  if (v === "" || v === "0") return v === "" ? "" : "0";
  const n = Number(v);
  return isNaN(n) || n < 0 ? "0" : v;
}

/* ─── Toggle Pill ─────────────────────────────────────────── */
const TogglePill: React.FC<{
  options: { label: string; value: string }[];
  value: string; onChange: (v: string) => void; disabled?: boolean; size?: "sm" | "xs";
}> = ({ options, value, onChange, disabled, size = "sm" }) => (
  <div className="inline-flex bg-gray-100 rounded-lg p-0.5 gap-0.5">
    {options.map(o => (
      <button key={o.value} type="button" disabled={disabled} onClick={() => onChange(o.value)}
        className={`${size === "xs" ? "px-2 py-1 text-[10px]" : "px-3 py-1.5 text-xs"} font-semibold rounded-md transition-all disabled:opacity-40 ${value === o.value ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}>
        {o.label}
      </button>
    ))}
  </div>
);

/* ─── Checkbox ────────────────────────────────────────────── */
const Checkbox: React.FC<{ checked: boolean; onChange: () => void; disabled?: boolean }> = ({ checked, onChange, disabled }) => (
  <button type="button" disabled={disabled} onClick={onChange}
    className={`w-[18px] h-[18px] rounded-[5px] border-2 flex items-center justify-center transition-all flex-shrink-0 ${checked ? "bg-gray-900 border-gray-900" : "border-gray-300 bg-white hover:border-gray-400"} ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}>
    {checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
  </button>
);

/* ─── Payment Method Dropdown ─────────────────────────────── */
const METHODS = [
  { key: "Cash", icon: Banknote, label: "Cash" },
  { key: "Bank Transfer", icon: Building, label: "Bank Transfer" },
  { key: "Digital Wallet", icon: Smartphone, label: "Digital Wallet" },
  { key: "Cheque", icon: FileText, label: "Cheque" },
] as const;

const MethodDropdown: React.FC<{ value: string; onChange: (v: string) => void }> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const cur = METHODS.find(m => m.key === value) ?? METHODS[0];
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(!open)}
        className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 bg-white hover:border-gray-300 transition-colors">
        <cur.icon className="w-3.5 h-3.5 text-gray-500" />
        <span className="text-[12px] font-semibold text-gray-700">{cur.label}</span>
        <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-1 w-[180px]">
          {METHODS.map(m => {
            const Ic = m.icon;
            return (
              <button key={m.key} type="button" onClick={() => { onChange(m.key); setOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-[12px] font-medium transition-colors ${m.key === value ? "bg-gray-50 text-gray-900" : "text-gray-600 hover:bg-gray-50"}`}>
                <Ic className="w-3.5 h-3.5" />{m.label}
                {m.key === value && <Check className="w-3 h-3 ml-auto text-gray-500" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ─── Main Modal ──────────────────────────────────────────── */
const FeeAddModal: React.FC<Props> = ({ isOpen, onClose, onSuccess, fee }) => {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [feeInfo, setFeeInfo] = useState<FeeInfo | null>(null);
  const [loadingFeeInfo, setLoadingFeeInfo] = useState(false);

  const [admBase, setAdmBase] = useState("");
  const [admDisc, setAdmDisc] = useState(0);
  const [admDiscType, setAdmDiscType] = useState<"cash" | "percentage">("cash");
  const [admPayingNow, setAdmPayingNow] = useState("");
  const [initialAdmPaid, setInitialAdmPaid] = useState(0);

  const [progEntries, setProgEntries] = useState<ProgramFeeEntry[]>([]);
  const [progPeriod, setProgPeriod] = useState(getCurrentPeriod());
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);

  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());

  // Single "total to pay" input that drives auto-distribution across checked items
  const [totalPayInput, setTotalPayInput] = useState("");

  const [settings, setSettings] = useState<any>(null);
  const [thermalFee, setThermalFee] = useState<any>(null);
  const printRef = React.useRef<HTMLDivElement>(null);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/admin/settings`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data.data?.setting || data.data);
      }
    } catch (e) { console.error("Settings fetch failed", e); }
  }, [BASE_URL]);

  useEffect(() => {
    if (isOpen) fetchSettings();
  }, [isOpen, fetchSettings]);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Thermal_Bill_New`,
  });

  useEffect(() => {
    const h = (e: MouseEvent) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false); };
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
  }, []);

  const fetchFeeInfo = useCallback(async (studentId: string, month?: string) => {
    if (!studentId) return;
    try {
      setLoadingFeeInfo(true);
      const token = localStorage.getItem("token");
      let url = `${BASE_URL}/admin/students/${studentId}/fee-info`;
      if (month) url += `?month_year=${encodeURIComponent(month)}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) {
        const d = data.data as FeeInfo;
        setFeeInfo(d);
        if (d.admission_exists) {
          setAdmBase((d.admission_amount ?? 0).toString());
          setAdmDisc(d.admission_discount ?? 0);
          setAdmDiscType(d.admission_discount_type ?? "cash");
          setInitialAdmPaid(d.admission_paid_amount ?? 0);
        } else {
          setAdmBase((d.global_admission_fee ?? 0).toString());
          setAdmDisc(0); setAdmDiscType("cash"); setInitialAdmPaid(0);
        }
        setAdmPayingNow(""); setTotalPayInput("");
        if (d.period_record) {
          setRemarks(prev => prev || d.period_record?.remarks || "");
          setPaymentMethod(prev => prev === "Cash" ? (d.period_record?.payment_method || "Cash") : prev);
        }
        if (d.program_fees?.programs_breakdown) {
          setProgEntries(d.program_fees.programs_breakdown.map(pb => ({
            id: pb.id, title: pb.title, base: pb.program_fee,
            discount: pb.discount || 0,
            discountType: (pb.discount_type as "cash" | "percentage") || "cash",
            payingNow: "", initialPaid: pb.paid_amount || 0,
          })));
        }
      }
    } catch (err) { console.error("Fee info error:", err); } finally { setLoadingFeeInfo(false); }
  }, [BASE_URL]);

  useEffect(() => {
    if (!feeInfo) return;
    const ids = new Set<string>();
    if (feeInfo.admission_exists || (feeInfo.global_admission_fee ?? 0) > 0) ids.add("admission");
    feeInfo.program_fees?.programs_breakdown?.forEach(pb => ids.add(String(pb.id)));
    setCheckedIds(ids);
  }, [feeInfo]);

  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      try {
        setLoadingStudents(true);
        const token = localStorage.getItem("token");
        const res = await fetch(`${BASE_URL}/admin/students?per_page=1000`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        setStudents(data.data?.data || data.data || []);
      } catch { toast.error("Failed to load students"); } finally { setLoadingStudents(false); }
    })();
    if (fee) {
      setSelectedStudentId(fee.student_id?.toString() ?? "");
      setSelectedStudent(fee.student ?? null);
      setSearchQuery(fee.student?.name ?? "");
      setProgPeriod(fee.month_year ?? "");
      setPaymentMethod(fee.payment_method ?? "Cash");
      setRemarks(fee.remarks ?? "");
      fetchFeeInfo(fee.student_id?.toString(), fee.month_year);
    }
  }, [isOpen, fee, fetchFeeInfo, BASE_URL]);

  /* ─── Calculations ─────────────────────────────────── */
  const calculations = useMemo(() => {
    const admissionPaidGlobally = feeInfo?.admission_paid ?? false;
    const admBaseNum = Number(admBase) || 0;
    const admNet = calcNet(admBaseNum, admDisc, admDiscType);
    const admCurrentPaying = Math.max(0, Number(admPayingNow) || 0);
    const totalAdmPaid = initialAdmPaid + admCurrentPaying;
    const admDue = admNet - initialAdmPaid; // "still owed before this session"
    const admRemaining = admDue - admCurrentPaying; // after entering paying now
    const hasAdm = (admBaseNum > 0 || admCurrentPaying > 0 || initialAdmPaid > 0) && !(admissionPaidGlobally && admDue <= 0 && !fee);

    const progData = progEntries.map(pe => {
      const net = calcNet(pe.base, pe.discount, pe.discountType);
      const currentPaying = Math.max(0, Number(pe.payingNow) || 0);
      const due = net - (pe.initialPaid || 0); // owed before this session (can be negative = credit)
      const remaining = due - currentPaying; // after this payment
      const totalPaid = (pe.initialPaid || 0) + currentPaying;
      return { ...pe, net, currentPaying, totalPaid, due, remaining };
    });

    const progBaseSum = progData.reduce((a, c) => a + c.base, 0);
    const progNetSum = progData.reduce((a, c) => a + c.net, 0);
    const hasProg = progBaseSum > 0;

    const grandTotal = (hasAdm ? admNet : 0) + (hasProg ? progNetSum : 0);
    const totalCollected = (hasAdm ? totalAdmPaid : 0) + progData.reduce((a, c) => a + c.totalPaid, 0);
    const grandDue = Math.max(0, grandTotal - totalCollected);
    const totalDiscount = (hasAdm ? (admBaseNum - admNet) : 0) + progData.reduce((a, c) => a + (c.base - c.net), 0);

    return {
      hasAdm, hasProg, admBaseNum, admNet, totalAdmPaid, admDue, admRemaining, admCurrentPaying,
      admissionPaidGlobally, progData, progBaseSum, progNetSum, grandTotal, totalCollected, grandDue, totalDiscount,
    };
  }, [admBase, admDisc, admDiscType, admPayingNow, initialAdmPaid, progEntries, fee, feeInfo]);

  // Total DUE (before this session) for checked items
  const selectedDueTotal = useMemo(() => {
    let t = 0;
    if (checkedIds.has("admission") && calculations.hasAdm) t += calculations.admDue;
    calculations.progData.forEach(p => { if (checkedIds.has(String(p.id))) t += p.due; });
    return t;
  }, [checkedIds, calculations]);

  // Total being paid THIS session for checked items
  const selectedPayingTotal = useMemo(() => {
    let t = 0;
    if (checkedIds.has("admission") && calculations.hasAdm) t += calculations.admCurrentPaying;
    calculations.progData.forEach(p => { if (checkedIds.has(String(p.id))) t += p.currentPaying; });
    return t;
  }, [checkedIds, calculations]);

  const excessAmount = Math.max(0, selectedPayingTotal - selectedDueTotal);
  const hasExcess = excessAmount > 0;

  const selectedCheckedCount = useMemo(() => {
    let c = 0;
    if (checkedIds.has("admission") && calculations.hasAdm) c++;
    calculations.progData.forEach(p => { if (checkedIds.has(String(p.id))) c++; });
    return c;
  }, [checkedIds, calculations]);

  const totalItemCount = useMemo(() => {
    let c = 0;
    if (calculations.hasAdm) c++;
    c += calculations.progData.length;
    return c;
  }, [calculations]);

  const allChecked = selectedCheckedCount === totalItemCount && totalItemCount > 0;

  const toggleCheck = (id: string) => setCheckedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll = () => {
    if (allChecked) { setCheckedIds(new Set()); return; }
    const ids = new Set<string>();
    if (calculations.hasAdm) ids.add("admission");
    calculations.progData.forEach(p => ids.add(String(p.id)));
    setCheckedIds(ids);
  };

  /* ─── Auto-distribute total pay input ─────────────── */
  const applyDistribution = useCallback((amount: number) => {
    const items: { id: string; due: number }[] = [];
    if (checkedIds.has("admission") && calculations.hasAdm && calculations.admDue > 0)
      items.push({ id: "admission", due: calculations.admDue });
    calculations.progData.forEach(p => {
      if (checkedIds.has(String(p.id)) && p.due > 0)
        items.push({ id: String(p.id), due: p.due });
    });

    if (items.length === 0) return;

    const dist = distributePayment(amount, items);
    if (dist["admission"] !== undefined) setAdmPayingNow(dist["admission"] > 0 ? dist["admission"].toString() : "");
    setProgEntries(prev => prev.map(pe => ({
      ...pe,
      payingNow: dist[String(pe.id)] !== undefined
        ? (dist[String(pe.id)] > 0 ? dist[String(pe.id)].toString() : "")
        : pe.payingNow,
    })));
  }, [checkedIds, calculations]);

  const handleTotalPayChange = (raw: string) => {
    const clamped = clamp(raw);
    setTotalPayInput(clamped);
    applyDistribution(Number(clamped) || 0);
  };

  const handlePayFull = () => {
    if (selectedCheckedCount === 0) { toast.error("Select at least one item"); return; }
    const full = String(selectedDueTotal);
    setTotalPayInput(full);
    applyDistribution(selectedDueTotal);
  };

  const handleClear = () => {
    setAdmPayingNow("");
    setProgEntries(prev => prev.map(pe => ({ ...pe, payingNow: "" })));
    setTotalPayInput("");
    toast("Payment amounts cleared", { icon: "🗑️" });
  };

  const handleSubmit = async () => {
    if (!selectedStudentId) { toast.error("Please select a student"); return; }
    if (!calculations.hasAdm && !calculations.hasProg) { toast.error("Enter at least one fee amount"); return; }

    const feeType = calculations.hasAdm && calculations.hasProg ? "billing" : calculations.hasAdm ? "admission" : "program";

    try {
      setLoading(true);
      const token = localStorage.getItem("token")!;
      const url = fee ? `${BASE_URL}/admin/student-fees/${fee.id}` : `${BASE_URL}/admin/student-fees`;

      const payload: Record<string, any> = {
        student_id: selectedStudentId,
        fee_type: feeType,
        month_year: progPeriod,
        payment_method: paymentMethod,
        remarks: remarks || `${feeType} — ${progPeriod}`,
      };

      if (calculations.hasAdm) {
        payload.admission_fee = calculations.admBaseNum;
        payload.admission_discount = admDisc;
        payload.admission_discount_type = admDiscType;
        payload.admission_paid_amount = calculations.totalAdmPaid;
      }

      if (calculations.hasProg) {
        payload.selected_programs = calculations.progData.map(p => p.id);
        payload.program_payments = {};
        calculations.progData.forEach(p => { payload.program_payments[p.id] = p.totalPaid; });
        payload.program_discounts = {};
        calculations.progData.forEach(p => { payload.program_discounts[p.id] = { amount: p.discount, type: p.discountType }; });
      }

      const res = await fetch(url, {
        method: fee ? "PUT" : "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to save payment");

      toast.success("Payment processed successfully!");
      
      // Auto-trigger Thermal Print
      // Construct a temporary fee object for the receipt
      const printFee = {
        id: result.id || fee?.id || "N/A",
        student: selectedStudent,
        month_year: progPeriod,
        payment_method: paymentMethod,
        fee_type: feeType,
        total_amount: calculations.grandTotal,
        gross_amount: calculations.progBaseSum + (calculations.hasAdm ? calculations.admBaseNum : 0),
        discount_amount: calculations.totalDiscount,
        paid_amount: calculations.totalCollected,
        payments: [{
          created_at: new Date().toISOString(),
          payment_method: paymentMethod,
          paid_amount: calculations.totalCollected
        }]
      };
      
      setThermalFee(printFee);
      
      setTimeout(() => {
        handlePrint();
        onSuccess(); 
        onClose();
      }, 500);
    } catch (e: any) { 
      toast.error(e.message); 
    } finally { 
      setLoading(false); 
    }
  };

  const filteredStudents = useMemo(() => students.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase())), [students, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4 font-sans">
      <div className="bg-white w-full max-w-[1080px] max-h-[93vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gray-900 rounded-xl flex items-center justify-center"><Receipt className="w-[18px] h-[18px] text-white" /></div>
            <div>
              <h2 className="text-[15px] font-bold text-gray-900">{fee ? "Edit Payment" : "Record Payment"}</h2>
              <p className="text-[11px] text-gray-400 mt-0.5">{selectedStudent ? `Processing for ${selectedStudent.name}` : "Select a student to begin"}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><X className="w-4 h-4 text-gray-400" /></button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-5">

            {/* 1. Student */}
            <section className="space-y-2.5">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-md bg-gray-900 text-white flex items-center justify-center text-[11px] font-bold">1</span>
                <h3 className="text-[13px] font-bold text-gray-800">Student Details</h3>
              </div>
              {!fee && !selectedStudent ? (
                <div ref={dropdownRef} className="relative">
                  <div className="flex items-center gap-2.5 border border-gray-200 rounded-xl px-3.5 py-2.5 bg-white focus-within:border-gray-400 focus-within:ring-2 focus-within:ring-gray-100 transition-all">
                    <Search className="w-4 h-4 text-gray-300" />
                    <input type="text" value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setDropdownOpen(true); }} onFocus={() => setDropdownOpen(true)} placeholder="Search by name or class..." className="flex-1 bg-transparent outline-none text-sm placeholder:text-gray-300 text-gray-800" />
                  </div>
                  {dropdownOpen && filteredStudents.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-52 overflow-y-auto py-1">
                      {filteredStudents.slice(0, 50).map(s => (
                        <button key={s.id} onClick={() => { setSelectedStudent(s); setSelectedStudentId(s.id.toString()); setDropdownOpen(false); fetchFeeInfo(s.id.toString()); }}
                          className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm flex items-center justify-between transition-colors">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-600">{initials(s.name)}</div>
                            <span className="font-medium text-gray-800">{s.name}</span>
                          </div>
                          <span className="text-[11px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md font-medium">{s.classes}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3.5 p-3.5 bg-gray-50 border border-gray-100 rounded-xl">
                  <div className="w-11 h-11 rounded-xl bg-gray-900 text-white flex items-center justify-center font-bold text-xs">{initials(selectedStudent?.name ?? "??")}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{selectedStudent?.name}</p>
                    <p className="text-[11px] text-gray-400 font-medium">{selectedStudent?.classes}</p>
                  </div>
                  {!fee && (
                    <button onClick={() => { setSelectedStudent(null); setSelectedStudentId(""); setFeeInfo(null); setProgEntries([]); setCheckedIds(new Set()); setTotalPayInput(""); }}
                      className="text-[11px] font-semibold text-gray-500 hover:text-gray-900 bg-white border border-gray-200 px-3 py-1.5 rounded-lg transition-colors">Change</button>
                  )}
                </div>
              )}
            </section>

            {/* 2. Fee Breakdown */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-md bg-gray-900 text-white flex items-center justify-center text-[11px] font-bold">2</span>
                  <h3 className="text-[13px] font-bold text-gray-800">Fee Breakdown</h3>
                </div>
                <div className="flex items-center gap-2">
                  <MethodDropdown value={paymentMethod} onChange={setPaymentMethod} />
                  <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-1.5 bg-white">
                    <Calendar className="w-3.5 h-3.5 text-gray-300" />
                    <input type="text" value={progPeriod} onChange={e => setProgPeriod(e.target.value)} className="bg-transparent outline-none text-[12px] font-medium w-36 text-gray-700" placeholder="Billing period..." />
                  </div>
                </div>
              </div>

              {loadingFeeInfo && selectedStudent ? (
                <div className="text-center py-12 bg-gray-50 border border-gray-100 rounded-xl">
                  <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-xs text-gray-400 font-medium">Loading fee details...</p>
                </div>
              ) : selectedStudent && (calculations.hasAdm || calculations.hasProg) ? (
                <div className="space-y-3">

                  {/* THE TABLE */}
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-100 bg-gray-50/70">
                            <th className="w-10 px-3 py-2.5"><Checkbox checked={allChecked} onChange={toggleAll} /></th>
                            <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Item</th>
                            <th className="text-right px-3 py-2.5 w-[90px] text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Base</th>
                            <th className="text-center px-3 py-2.5 w-[170px] text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Discount</th>
                            <th className="text-right px-3 py-2.5 w-[80px] text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Net</th>
                            <th className="px-3 py-2.5 w-[170px] text-[11px] font-semibold text-gray-400 uppercase tracking-wider text-center">Paying Now</th>
                            <th className="text-right px-3 py-2.5 w-[80px] text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Balance</th>
                            <th className="text-center px-3 py-2.5 w-[70px] text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">

                          {/* Admission Row */}
                          {calculations.hasAdm && (
                            <tr className={`group transition-colors ${calculations.admissionPaidGlobally ? "bg-emerald-50/40" : "hover:bg-gray-50/50"}`}>
                              <td className="px-3 py-3"><Checkbox checked={checkedIds.has("admission")} onChange={() => toggleCheck("admission")} disabled={calculations.admissionPaidGlobally} /></td>
                              <td className="px-3 py-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0"><Wallet className="w-3.5 h-3.5 text-blue-500" /></div>
                                  <div>
                                    <p className="text-[13px] font-semibold text-gray-800">Admission Fee</p>
                                    {calculations.admissionPaidGlobally && <span className="text-[10px] text-emerald-600 font-bold">FULLY PAID</span>}
                                  </div>
                                </div>
                              </td>
                              <td className="px-3 py-3">
                                <input type="number" min={0} value={admBase} onChange={e => setAdmBase(clamp(e.target.value))} onKeyDown={blockNeg}
                                  className="w-full text-right bg-gray-50 border border-gray-100 rounded-lg px-2 py-1.5 text-[12px] outline-none focus:border-gray-300 font-medium disabled:opacity-50" disabled={calculations.admissionPaidGlobally} />
                              </td>
                              <td className="px-3 py-3">
                                <div className="flex items-center justify-end gap-1.5">
                                  <input type="number" min={0} value={admDisc || ""} onChange={e => setAdmDisc(Math.max(0, Number(e.target.value) || 0))} onKeyDown={blockNeg}
                                    className="w-14 text-right bg-gray-50 border border-gray-100 rounded-lg px-2 py-1.5 text-[12px] outline-none focus:border-gray-300 disabled:opacity-50" placeholder="0" disabled={calculations.admissionPaidGlobally} />
                                  <TogglePill size="xs" options={[{ label: "Rs.", value: "cash" }, { label: "%", value: "percentage" }]} value={admDiscType} onChange={v => setAdmDiscType(v as "cash" | "percentage")} disabled={calculations.admissionPaidGlobally} />
                                </div>
                              </td>
                              {/* Net — this is what the student actually owes total */}
                              <td className="px-3 py-3 text-right">
                                <span className="text-[13px] font-bold text-gray-900">{fmtS(calculations.admNet)}</span>
                              </td>
                              <td className="px-3 py-3">
                                <div className="space-y-1">
                                  {initialAdmPaid > 0 && (
                                    <div className="flex justify-between items-center bg-emerald-50/80 rounded-md px-2 py-0.5">
                                      <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider">Prev paid</span>
                                      <span className="text-[11px] font-bold text-emerald-700">{fmtS(initialAdmPaid)}</span>
                                    </div>
                                  )}
                                  <input type="number" min={0} value={admPayingNow} onChange={e => setAdmPayingNow(clamp(e.target.value))} onKeyDown={blockNeg}
                                    className="w-full text-right bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-[12px] outline-none focus:border-gray-400 font-semibold disabled:opacity-50 placeholder:text-gray-300" placeholder="0" disabled={calculations.admissionPaidGlobally} />
                                </div>
                              </td>
                              {/* Balance = net − initialPaid − payingNow */}
                              <td className="px-3 py-3 text-right">
                                <span className={`text-[13px] font-bold ${calculations.admRemaining > 0 ? "text-amber-600" : calculations.admRemaining < 0 ? "text-emerald-600" : "text-gray-300"}`}>
                                  {calculations.admRemaining !== 0 ? (calculations.admRemaining < 0 ? `+${fmtS(Math.abs(calculations.admRemaining))} CR` : fmtS(calculations.admRemaining)) : "—"}
                                </span>
                              </td>
                              <td className="px-3 py-3 text-center">
                                {calculations.admRemaining <= 0 && calculations.admNet > 0
                                  ? <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">PAID</span>
                                  : calculations.admNet > 0
                                    ? <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">DUE</span>
                                    : <span className="text-gray-300">—</span>}
                              </td>
                            </tr>
                          )}

                          {/* Program Rows */}
                          {calculations.progData.map(p => (
                            <tr key={p.id} className="group hover:bg-gray-50/50 transition-colors">
                              <td className="px-3 py-3"><Checkbox checked={checkedIds.has(String(p.id))} onChange={() => toggleCheck(String(p.id))} /></td>
                              <td className="px-3 py-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0"><BookOpen className="w-3.5 h-3.5 text-violet-500" /></div>
                                  <p className="text-[13px] font-semibold text-gray-800 truncate max-w-[180px]">{p.title}</p>
                                </div>
                              </td>
                              <td className="px-3 py-3 text-right">
                                <span className="text-[12px] text-gray-500 font-medium bg-gray-50 px-2 py-1 rounded-md">{fmtS(p.base)}</span>
                              </td>
                              <td className="px-3 py-3">
                                <div className="flex items-center justify-end gap-1.5">
                                  <input type="number" min={0} value={p.discount || ""} onChange={e => setProgEntries(prev => prev.map(o => o.id === p.id ? { ...o, discount: Math.max(0, Number(e.target.value) || 0) } : o))} onKeyDown={blockNeg}
                                    className="w-14 text-right bg-gray-50 border border-gray-100 rounded-lg px-2 py-1.5 text-[12px] outline-none focus:border-gray-300" placeholder="0" />
                                  <TogglePill size="xs" options={[{ label: "Rs.", value: "cash" }, { label: "%", value: "percentage" }]} value={p.discountType} onChange={v => setProgEntries(prev => prev.map(o => o.id === p.id ? { ...o, discountType: v as "cash" | "percentage" } : o))} />
                                </div>
                              </td>
                              <td className="px-3 py-3 text-right">
                                <span className="text-[13px] font-bold text-gray-900">{fmtS(p.net)}</span>
                              </td>
                              <td className="px-3 py-3">
                                <div className="space-y-1">
                                  {(p.initialPaid ?? 0) > 0 && (
                                    <div className="flex justify-between items-center bg-emerald-50/80 rounded-md px-2 py-0.5">
                                      <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider">Prev paid</span>
                                      <span className="text-[11px] font-bold text-emerald-700">{fmtS(p.initialPaid!)}</span>
                                    </div>
                                  )}
                                  <input type="number" min={0} value={p.payingNow} onChange={e => setProgEntries(prev => prev.map(o => o.id === p.id ? { ...o, payingNow: clamp(e.target.value) } : o))} onKeyDown={blockNeg}
                                    className="w-full text-right bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-[12px] outline-none focus:border-gray-400 font-semibold placeholder:text-gray-300" placeholder="0" />
                                </div>
                              </td>
                              {/* Balance = net − initialPaid − payingNow */}
                              <td className="px-3 py-3 text-right">
                                <span className={`text-[13px] font-bold ${p.remaining > 0 ? "text-amber-600" : p.remaining < 0 ? "text-emerald-600" : "text-gray-300"}`}>
                                  {p.remaining !== 0 ? (p.remaining < 0 ? `+${fmtS(Math.abs(p.remaining))} CR` : fmtS(p.remaining)) : "—"}
                                </span>
                              </td>
                              <td className="px-3 py-3 text-center">
                                {p.remaining <= 0 && p.net > 0
                                  ? <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">PAID</span>
                                  : p.net > 0
                                    ? <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">DUE</span>
                                    : <span className="text-gray-300">—</span>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* ─── SUMMARY BAR with inline total-pay input ─── */}
                  <div className={`rounded-xl px-4 py-3 border transition-colors ${hasExcess ? "bg-amber-50 border-amber-200" : "bg-gray-50 border-gray-200"}`}>
                    <div className="flex items-center justify-between gap-4 flex-wrap">

                      {/* Left: stats */}
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-gray-400 font-medium">Selected</span>
                          <span className="text-[13px] font-bold text-gray-900">
                            {selectedCheckedCount}<span className="text-gray-400 font-medium text-[11px]">/{totalItemCount}</span>
                          </span>
                        </div>
                        <div className="w-px h-5 bg-gray-200" />
                        <div>
                          <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest block mb-px">Due This Session</span>
                          <span className={`text-[15px] font-extrabold ${selectedDueTotal > 0 ? "text-gray-900" : "text-emerald-600"}`}>{fmt(selectedDueTotal)}</span>
                        </div>
                        {calculations.totalDiscount > 0 && (
                          <>
                            <div className="w-px h-5 bg-gray-200" />
                            <div>
                              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest block mb-px">Discount</span>
                              <span className="text-[13px] font-bold text-gray-500">−{fmt(calculations.totalDiscount)}</span>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Right: pay input + actions */}
                      <div className="flex items-center gap-2.5 flex-wrap">
                        {/* Excess / return indicator */}
                        {hasExcess && (
                          <div className="flex items-center gap-1.5 bg-white border border-amber-200 rounded-lg px-2.5 py-1.5">
                            <RotateCcw className="w-3 h-3 text-amber-500 flex-shrink-0" />
                            <div>
                              <span className="text-[8px] text-amber-500 font-bold uppercase tracking-widest block leading-none mb-0.5">Return</span>
                              <span className="text-[13px] font-extrabold text-amber-600 leading-none">{fmt(excessAmount)}</span>
                            </div>
                          </div>
                        )}

                        {/* Clear */}
                        <button onClick={handleClear}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-gray-400 hover:text-red-500 rounded-lg text-[11px] font-medium transition-colors border border-transparent hover:border-red-100 hover:bg-red-50">
                          <RotateCcw className="w-3 h-3" />Clear
                        </button>

                        {/* Pay Full shortcut */}
                        <button onClick={handlePayFull} disabled={selectedCheckedCount === 0 || selectedDueTotal <= 0}
                          className="px-3 py-1.5 text-[11px] font-semibold text-gray-600 bg-white border border-gray-200 hover:border-gray-300 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                          Pay Full
                        </button>

                        {/* Total-to-pay input — auto-distributes on every keystroke */}
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] font-bold text-gray-400 pointer-events-none">Rs.</span>
                          <input
                            type="number"
                            min={0}
                            value={totalPayInput}
                            onChange={e => handleTotalPayChange(e.target.value)}
                            onKeyDown={blockNeg}
                            placeholder={selectedDueTotal > 0 ? fmtS(selectedDueTotal) : "0"}
                            disabled={selectedCheckedCount === 0}
                            className={`w-[160px] bg-white border rounded-xl pl-7 pr-3 py-2 text-[14px] font-bold outline-none transition-all placeholder:text-gray-300 placeholder:font-medium disabled:opacity-40
                              ${hasExcess
                                ? "border-amber-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 text-amber-700"
                                : Number(totalPayInput) > 0
                                  ? "border-emerald-300 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 text-emerald-700"
                                  : "border-gray-300 focus:border-gray-400 focus:ring-2 focus:ring-gray-100 text-gray-900"
                              }`}
                          />
                          {Number(totalPayInput) > 0 && (
                            <span className="absolute -top-2 left-3 text-[9px] font-bold bg-white px-1 text-gray-400 uppercase tracking-widest">
                              Total paying
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Hint when nothing selected */}
                    {selectedCheckedCount === 0 && (
                      <p className="text-[11px] text-gray-400 mt-2">☝ Check items above to activate payment entry</p>
                    )}
                  </div>

                </div>
              ) : !selectedStudent ? (
                <div className="text-center py-12 bg-gray-50/50 border border-dashed border-gray-200 rounded-xl">
                  <User className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                  <p className="text-xs text-gray-400 font-medium">Select a student to view fee breakdown</p>
                </div>
              ) : !loadingFeeInfo ? (
                <div className="text-center py-12 bg-gray-50/50 border border-dashed border-gray-200 rounded-xl">
                  <Receipt className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                  <p className="text-xs text-gray-400 font-medium">No fee items found for this student</p>
                </div>
              ) : null}
            </section>

            {/* 3. Notes */}
            <section className="space-y-2.5">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-md bg-gray-200 text-gray-600 flex items-center justify-center text-[11px] font-bold"><MessageSquare className="w-3 h-3" /></span>
                <h3 className="text-[13px] font-bold text-gray-800">Notes</h3>
              </div>
              <textarea value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Optional payment notes..."
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-[12px] outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 resize-none h-[68px] bg-white placeholder:text-gray-300" rows={2} />
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Total cost</p>
                <p className="text-lg font-extrabold text-gray-400 tracking-tight">{fmt(calculations.progBaseSum + (calculations.hasAdm ? calculations.admBaseNum : 0))}</p>
              </div>
              <div className="flex items-center text-gray-300 text-lg font-light">−</div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Discount</p>
                <p className="text-lg font-extrabold text-blue-500 tracking-tight">{fmt(calculations.totalDiscount)}</p>
              </div>
              <div className="flex items-center text-gray-300 text-lg font-light">=</div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Final Bill</p>
                <p className="text-lg font-extrabold text-gray-900 tracking-tight">{fmt(calculations.grandTotal)}</p>
              </div>
              <div className="w-px h-9 bg-gray-100 mx-1" />
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Collecting</p>
                <p className="text-lg font-extrabold text-emerald-600 tracking-tight">{fmt(calculations.totalCollected)}</p>
              </div>
              <div className="w-px h-9 bg-gray-100 mx-1" />
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Balance Due</p>
                <p className={`text-lg font-extrabold tracking-tight ${calculations.grandDue > 0 ? "text-amber-600" : calculations.grandDue < 0 ? "text-emerald-600" : "text-emerald-600"}`}>
                  {calculations.grandDue < 0 ? `+${fmt(Math.abs(calculations.grandDue))} Credit` : fmt(calculations.grandDue)}
                </p>
              </div>
            </div>
            <button onClick={handleSubmit} disabled={loading || !selectedStudentId}
              className="flex items-center gap-2 px-7 py-3 bg-gray-900 hover:bg-black text-white rounded-xl text-[13px] font-bold transition-all shadow-lg shadow-gray-900/10 disabled:opacity-40 disabled:cursor-not-allowed">
              <CreditCard className="w-4 h-4" />
              {loading ? "Processing..." : fee ? "Update Payment" : "Record Payment"}
            </button>
          </div>
          <div className="mt-3 bg-gray-100 rounded-full h-1 overflow-hidden">
            <div className="h-1 rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${calculations.grandTotal > 0 ? Math.min(100, (calculations.totalCollected / calculations.grandTotal) * 100) : 0}%`,
                backgroundColor: calculations.totalCollected >= calculations.grandTotal && calculations.grandTotal > 0 ? "#10b981" : "#6366f1",
              }} />
          </div>
        </div>
      </div>
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        {thermalFee && <ThermalBill ref={printRef} fee={thermalFee} settings={settings} />}
      </div>
    </div>
  );
};

export default FeeAddModal; 