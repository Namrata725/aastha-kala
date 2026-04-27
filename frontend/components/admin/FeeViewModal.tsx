"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import {
  X, User, CreditCard, Calendar, Printer,
  CheckCircle2, Clock, Wallet, Info, Receipt, Layers,
  Banknote, Building, Smartphone, FileText, BookOpen,
  Loader2, History
} from "lucide-react";
import toast from "react-hot-toast";
import { useReactToPrint } from "react-to-print";
import { ThermalBill } from "./ThermalBill";
import { A4Bill } from "./A4Bill";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  fee: any; 
}

interface ProgramItem {
  id: number | string;
  title: string;
  base: number;
  disc: number;
  discType: "cash" | "percentage";
  net: number;
  totalPaid: number;
  remaining: number;
}

/* ─── Helpers (mirrors FeeAddModal) ──────────────────────── */
function calcNet(base: number, discount: number, type: "cash" | "percentage"): number {
  if (!discount || discount <= 0) return base;
  if (type === "percentage") return Math.max(0, base - (base * Math.min(discount, 100)) / 100);
  return Math.max(0, base - discount);
}
function fmt(n: number) { return "Rs. " + Math.round(n).toLocaleString("en-IN"); }
function fmtS(n: number) { return Math.round(n).toLocaleString("en-IN"); }
function initials(name: string) { return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase(); }

const METHOD_MAP: Record<string, { icon: typeof Banknote; label: string }> = {
  "Cash": { icon: Banknote, label: "Cash" },
  "Bank Transfer": { icon: Building, label: "Bank Transfer" },
  "Digital Wallet": { icon: Smartphone, label: "Digital Wallet" },
  "Cheque": { icon: FileText, label: "Cheque" },
};

/* ─── Status Badge ───────────────────────────────────────── */
const StatusBadge: React.FC<{ remaining: number; net: number }> = ({ remaining, net }) => {
  if (net <= 0) return <span className="text-gray-300">—</span>;
  if (remaining <= 0)
    return <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">PAID</span>;
  return <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">DUE</span>;
};

/* ─── Balance Cell ───────────────────────────────────────── */
const BalanceCell: React.FC<{ value: number }> = ({ value }) => {
  if (value === 0) return <span className="text-gray-300">—</span>;
  if (value < 0)
    return <span className="text-[13px] font-bold text-emerald-600">+{fmtS(Math.abs(value))} CR</span>;
  return <span className="text-[13px] font-bold text-amber-600">{fmtS(value)}</span>;
};

/* ─── Discount Cell ──────────────────────────────────────── */
const DiscountCell: React.FC<{ amount: number; type: "cash" | "percentage"; saved: number }> = ({ amount, type, saved }) => {
  if (amount <= 0) return <span className="text-gray-300">—</span>;
  return (
    <span className="text-[11px] text-gray-500 font-medium">
      −{type === "percentage" ? `${amount}%` : fmtS(amount)}
      <span className="text-gray-400 ml-1">({fmtS(saved)})</span>
    </span>
  );
};

/* ─── Main Modal ─────────────────────────────────────────── */
const FeeViewModal: React.FC<Props> = ({ isOpen, onClose, fee }) => {
  const [enrichedFee, setEnrichedFee] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  const fetchFullDetails = useCallback(async (studentId: number | string, monthYear: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/admin/students/${studentId}/fee-info?month_year=${encodeURIComponent(monthYear)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const text = await res.text();
      let result;
      try {
        result = JSON.parse(text);
      } catch {
        console.error("Invalid response from server:", text);
        return;
      }
      if (res.ok && result.data) {
        // We merge the list record (which has the correct transaction-specific totals)
        // with the detailed breakdown from the fee-info API
        const data = result.data;
        setEnrichedFee({
          ...fee,
          admission_fee: data.admission_amount || fee.admission_fee,
          admission_discount: data.admission_discount,
          admission_discount_type: data.admission_discount_type || fee.admission_discount_type,
          admission_paid_amount: data.admission_paid_amount || fee.admission_paid_amount,
          programs_breakdown: data.program_fees?.programs_breakdown || [],
          // Keep authoritative totals from the original fee record if it has them
          total_amount: fee.total_amount,
          paid_amount: fee.paid_amount,
          pending_amount: fee.pending_amount,
          payments: data.payments || []
        });
      }
    } catch (error) {
      console.error("Failed to enrich fee data:", error);
    } finally {
      setLoading(false);
    }
  }, [BASE_URL, fee]);

  useEffect(() => {
    if (!isOpen || !fee) {
      setEnrichedFee(null);
      return;
    }

    // If it's already a full record (e.g. from a recent payment), don't fetch
    const isEnriched = fee.programs_breakdown || fee.admission_fee || fee.program_payments;
    
    if (!isEnriched && fee.student_id && fee.month_year) {
      fetchFullDetails(fee.student_id, fee.month_year);
    } else {
      setEnrichedFee(fee);
    }
  }, [isOpen, fee, fetchFullDetails]);

  // Use enriched data if available, fall back to passed fee
  const activeFee = enrichedFee || fee;
  const isIntegrated = activeFee?.fee_types?.includes("billing") || activeFee?.fee_type === "billing";
  const methodInfo = METHOD_MAP[activeFee?.payment_method] || METHOD_MAP["Cash"];
  const MethodIcon = methodInfo.icon;

  /* ── Parse admission ─────────────────────────────────── */
  const adm = useMemo(() => {
    if (!activeFee) return { base: 0, disc: 0, discType: "cash" as "cash" | "percentage", net: 0, totalPaid: 0, remaining: 0, exists: false };
    const base = Number(activeFee.admission_fee) || 0;
    const disc = Number(activeFee.admission_discount) || 0;
    const discType = (activeFee.admission_discount_type as "cash" | "percentage") || "cash";
    const net = calcNet(base, disc, discType);
    const totalPaid = Number(activeFee.admission_paid_amount) || 0;
    const remaining = net - totalPaid;
    // Only count admission if it was part of this billing (fee_types or fee_type)
    const wasInBilling = activeFee.fee_types?.includes("admission") || activeFee.fee_type === "admission" || isIntegrated;
    return { base, disc, discType, net, totalPaid, remaining, exists: base > 0 && wasInBilling };
  }, [activeFee, isIntegrated]);

  /* ── Parse programs ──────────────────────────────────── */
  const programs = useMemo<ProgramItem[]>(() => {
    if (!activeFee) return [];
    // Rich breakdown from server (same shape as fee-info endpoint)
    if (activeFee.programs_breakdown && Array.isArray(activeFee.programs_breakdown)) {
      return activeFee.programs_breakdown.map((pb: any) => {
        const base = Number(pb.program_fee) || 0;
        const disc = Number(pb.discount) || 0;
        const discType = (pb.discount_type as "cash" | "percentage") || "cash";
        const net = calcNet(base, disc, discType);
        const totalPaid = Number(pb.paid_amount) || 0;
        const remaining = net - totalPaid;
        return { id: pb.id, title: pb.title, base, disc, discType, net, totalPaid, remaining };
      });
    }
    // Map-based (FeeAddModal stores program_payments as {id: totalPaid})
    if (activeFee.program_payments && typeof activeFee.program_payments === "object") {
      const discounts: Record<string, any> = activeFee.program_discounts || {};
      const progList: any[] = activeFee.programs || activeFee.selected_programs_details || [];
      return Object.entries(activeFee.program_payments).map(([id, paid]) => {
        const d = discounts[id] || {};
        const prog = progList.find((p: any) => String(p.id) === id);
        const base = Number(prog?.program_fee || prog?.fee) || 0;
        const disc = Number(d.amount) || 0;
        const discType = (d.type as "cash" | "percentage") || "cash";
        const net = calcNet(base, disc, discType);
        const totalPaid = Number(paid) || 0;
        const remaining = net - totalPaid;
        return { id: Number(id), title: prog?.title || `Program #${id}`, base, disc, discType, net, totalPaid, remaining };
      });
    }
    // Legacy: single program_fee field
    if (Number(activeFee.program_fee) > 0) {
      const base = Number(activeFee.program_fee);
      const disc = Number(activeFee.program_discount) || 0;
      const discType = (activeFee.program_discount_type as "cash" | "percentage") || "cash";
      const net = calcNet(base, disc, discType);
      const isPaid = Number(activeFee.pending_amount || 0) <= 0;
      return [{ id: 0, title: "Program Fee", base, disc, discType, net, totalPaid: isPaid ? net : 0, remaining: isPaid ? 0 : net }];
    }
    return [];
  }, [activeFee]);

  /* ── Aggregate totals (from items) ───────────────────── */
  const itemTotals = useMemo(() => {
    const baseSum = (adm.exists ? adm.base : 0) + programs.reduce((a: number, c: ProgramItem) => a + c.base, 0);
    const netSum = (adm.exists ? adm.net : 0) + programs.reduce((a: number, c: ProgramItem) => a + c.net, 0);
    const paidSum = (adm.exists ? adm.totalPaid : 0) + programs.reduce((a: number, c: ProgramItem) => a + c.totalPaid, 0);
    const discountSum = baseSum - netSum;
    return { baseSum, netSum, paidSum, discountSum };
  }, [adm, programs]);

  // Footer: prefer authoritative server values, fall back to item calculations
  const footerBill = Number(activeFee?.total_amount) || itemTotals.netSum;
  const footerCollected = Number(activeFee?.paid_amount) || itemTotals.paidSum;
  const serverPending = Number(activeFee?.pending_amount);
  const footerDue = !isNaN(serverPending) ? serverPending : Math.max(0, footerBill - footerCollected);
  const footerCost = itemTotals.baseSum || footerBill; // Fallback to bill if base cost is missing
  const footerDiscount = footerCost - footerBill;

  const itemCount = (adm.exists ? 1 : 0) + programs.length;
  const paidCount = (adm.exists && adm.remaining <= 0 && adm.net > 0 ? 1 : 0)
    + programs.filter(p => p.remaining <= 0 && p.net > 0).length;
  const fullyPaid = paidCount === itemCount && itemCount > 0;

  const printRef = React.useRef<HTMLDivElement>(null);
  const [settings, setSettings] = useState<any>(null);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/admin/settings`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await res.json();
      if (data.success) setSettings(data.data.setting);
    } catch (e) { console.error("Failed to fetch settings", e); }
  }, [BASE_URL]);

  useEffect(() => {
    if (isOpen) fetchSettings();
  }, [isOpen, fetchSettings]);

  const printRefA4 = React.useRef<HTMLDivElement>(null);

  const handleThermalPrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Thermal_Bill_${fee?.id}`,
  });

  const handleA4Print = useReactToPrint({
    contentRef: printRefA4,
    documentTitle: `A4_Bill_${fee?.id}`,
  });

  // Prepare fee object for ThermalBill
  const thermalFee = activeFee ? {
    ...activeFee,
    discount: footerDiscount,
    // ensure student info is there
    student: activeFee?.student || { name: activeFee?.student_name || "N/A" }
  } : null;

  if (!isOpen || !fee) return null;

  return (
    <div className="fixed inset-0 bg-brand-deep/30 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-fade-in" onClick={onClose}>
      <style dangerouslySetInnerHTML={{ __html: "@media print { @page { margin: 0; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }" }} />
      <div
        className="bg-surface w-full max-w-[800px] max-h-[94vh] rounded-xl shadow-2xl flex flex-col overflow-hidden border border-white/20 animate-scale-in"
        onClick={e => e.stopPropagation()}
        id="receipt-content"
      >
        {/* ── Header ────────────────────────────────────── */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-surface/80 backdrop-blur-sm sticky top-0 z-20 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shadow-inner">
              <Receipt className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-black text-text-primary tracking-tight">Payment Receipt</h2>
              <p className="text-[10px] text-text-muted font-black uppercase tracking-widest mt-0.5">
                Ref: <span className="text-text-primary">#TRS-{activeFee.id?.toString().padStart(6, "0")}</span>
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center hover:bg-error/10 hover:text-error rounded-md transition-all duration-300 text-text-muted cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Body ──────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-5">

            {/* Print-only branding */}
            <div className="hidden print:block text-center mb-6 border-b border-gray-200 pb-5">
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">AASTHA KALA KENDRA</h1>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Professional Arts Center</p>
              {/* <div className="mt-2 flex justify-center gap-3 text-[9px] text-gray-400 uppercase tracking-widest">
                <span>Kathmandu, Nepal</span>
                <span>•</span>
                <span>+977 98XXXXXXXX</span>
              </div> */}
            </div>

            {/* Student card */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-100 rounded-lg">
              <div className="w-10 h-10 rounded-lg bg-gray-900 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                {initials(activeFee.student?.name || activeFee.student_name || "??")}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-gray-900 truncate">{activeFee.student?.name || activeFee.student_name || "N/A"}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-gray-400 font-bold">ID: #{activeFee.student_id}</span>
                  {activeFee.student?.classes && (
                    <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">{activeFee.student.classes}</span>
                  )}
                </div>
              </div>
              <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md flex-shrink-0 ${
                isIntegrated
                  ? "bg-violet-50 text-violet-700 border border-violet-100"
                  : activeFee.fee_type === "admission"
                    ? "bg-blue-50 text-blue-700 border border-blue-100"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-100"
              }`}>
                {isIntegrated ? "Integrated" : activeFee.fee_type === "admission" ? "Admission" : "Program"}
              </span>
            </div>

            {/* Meta row: Method · Period · Status */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-white border border-gray-200 rounded-lg">
                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-text-muted mb-1 flex items-center gap-1.5">
                  <MethodIcon className="w-3 h-3" /> Method
                </p>
                <p className="text-[11px] font-black text-text-primary uppercase tracking-tight">{methodInfo.label}</p>
              </div>
              <div className="p-3 bg-white border border-gray-200 rounded-lg">
                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-text-muted mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" /> Period
                </p>
                <p className="text-[11px] font-black text-text-primary uppercase tracking-tight truncate">{activeFee.month_year || "—"}</p>
              </div>
              <div className="p-3 bg-white border border-gray-200 rounded-lg">
                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-text-muted mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3" /> Status
                </p>
                {fullyPaid ? (
                  <span className="text-[11px] font-black uppercase text-emerald-600">Fully Paid</span>
                ) : footerCollected === 0 ? (
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] font-black uppercase text-red-600">Unpaid</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] font-black uppercase text-amber-600">Partial</span>
                  </div>
                )}
              </div>
            </div>

            {/* Breakdown Table */}
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3 border border-dashed border-gray-200 rounded-2xl">
                <Loader2 className="w-8 h-8 text-gray-300 animate-spin" />
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Enriching Data...</p>
              </div>
            ) : itemCount > 0 ? (
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/70">
                        <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Item</th>
                        <th className="text-right px-3 py-2.5 w-[85px] text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Base</th>
                        <th className="text-center px-3 py-2.5 w-[150px] text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Discount</th>
                        <th className="text-right px-3 py-2.5 w-[80px] text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Net</th>
                        <th className="text-right px-3 py-2.5 w-[85px] text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Paid</th>
                        <th className="text-right px-3 py-2.5 w-[80px] text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Balance</th>
                        <th className="text-center px-3 py-2.5 w-[70px] text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">

                      {/* Admission */}
                      {adm.exists && (
                        <tr className={`${adm.remaining <= 0 && adm.net > 0 ? "bg-emerald-50/30" : ""} transition-colors`}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                <Wallet className="w-3.5 h-3.5 text-blue-500" />
                              </div>
                              <p className="text-[13px] font-semibold text-gray-800">Admission Fee</p>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-right">
                            <span className="text-[12px] text-gray-500 font-medium bg-gray-50 px-2 py-1 rounded-md">{fmtS(adm.base)}</span>
                          </td>
                          <td className="px-3 py-3 text-center">
                            <DiscountCell amount={adm.disc} type={adm.discType} saved={adm.base - adm.net} />
                          </td>
                          <td className="px-3 py-3 text-right">
                            <span className="text-[13px] font-bold text-gray-900">{fmtS(adm.net)}</span>
                          </td>
                          <td className="px-3 py-3 text-right">
                            <span className="text-[12px] font-bold text-emerald-600">{fmtS(adm.totalPaid)}</span>
                          </td>
                          <td className="px-3 py-3 text-right">
                            <BalanceCell value={adm.remaining} />
                          </td>
                          <td className="px-3 py-3 text-center">
                            <StatusBadge remaining={adm.remaining} net={adm.net} />
                          </td>
                        </tr>
                      )}

                      {/* Programs */}
                      {programs.map((p) => (
                        <tr key={p.id} className={`${p.remaining <= 0 && p.net > 0 ? "bg-emerald-50/30" : "hover:bg-gray-50/50"} transition-colors`}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0">
                                <BookOpen className="w-3.5 h-3.5 text-violet-500" />
                              </div>
                              <p className="text-[13px] font-semibold text-gray-800 truncate max-w-[180px]">{p.title}</p>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-right">
                            <span className="text-[12px] text-gray-500 font-medium bg-gray-50 px-2 py-1 rounded-md">{fmtS(p.base)}</span>
                          </td>
                          <td className="px-3 py-3 text-center">
                            <DiscountCell amount={p.disc} type={p.discType} saved={p.base - p.net} />
                          </td>
                          <td className="px-3 py-3 text-right">
                            <span className="text-[13px] font-bold text-gray-900">{fmtS(p.net)}</span>
                          </td>
                          <td className="px-3 py-3 text-right">
                            <span className="text-[12px] font-bold text-emerald-600">{fmtS(p.totalPaid)}</span>
                          </td>
                          <td className="px-3 py-3 text-right">
                            <BalanceCell value={p.remaining} />
                          </td>
                          <td className="px-3 py-3 text-center">
                            <StatusBadge remaining={p.remaining} net={p.net} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}

            {/* Pending balance callout */}
            {!loading && footerDue > 0 && (
              <div className="px-5 py-4 bg-amber-50 rounded-xl border border-amber-200 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white border border-amber-200 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-amber-500" />
                  </div>
                  <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Balance Due</span>
                </div>
                <span className="text-xl font-bold text-amber-600">{fmt(footerDue)}</span>
              </div>
            )}

            {/* Transaction History Section */}
            {!loading && activeFee.payments && activeFee.payments.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-md bg-gray-900 text-white flex items-center justify-center text-[11px] font-bold"><History className="w-3 h-3" /></span>
                  <h3 className="text-[13px] font-bold text-gray-800">Payment History</h3>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="text-left px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</th>
                        <th className="text-left px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Method</th>
                        <th className="text-right px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {activeFee.payments
                        .filter((p: any) => Number(p.paid_amount) > 0)
                        .map((p: any, i: number) => (
                          <tr key={i} className="hover:bg-gray-50/50">
                            <td className="px-4 py-2.5 text-[12px] text-gray-600">
                              {new Date(p.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-2.5 text-[12px] text-gray-600">
                              {p.payment_method || "Cash"}
                            </td>
                            <td className="px-4 py-2.5 text-right text-[12px] font-bold text-emerald-600">
                              {fmt(p.paid_amount)}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Remarks */}
            {activeFee.remarks && (
              <div className="flex gap-3 px-1">
                <Info className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Remarks</p>
                  <p className="text-xs text-gray-600 mt-0.5">{activeFee.remarks}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Footer ────────────────────────────────────── */}
        <div className="px-6 py-4 border-t border-border bg-surface/80 backdrop-blur-sm sticky bottom-0">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex flex-col">
                <p className="text-[8px] text-text-muted font-black uppercase tracking-widest mb-0.5">Total</p>
                <p className="text-xs font-black text-text-muted tracking-tight whitespace-nowrap">{fmt(footerCost)}</p>
              </div>
              <div className="text-border text-xs font-light">−</div>
              <div className="flex flex-col">
                <p className="text-[8px] text-text-muted font-black uppercase tracking-widest mb-0.5">Disc</p>
                <p className="text-xs font-black text-primary tracking-tight whitespace-nowrap">{fmt(footerDiscount)}</p>
              </div>
              <div className="text-border text-xs font-light">=</div>
              <div className="flex flex-col">
                <p className="text-[8px] text-text-muted font-black uppercase tracking-widest mb-0.5">Bill</p>
                <p className="text-xs font-black text-text-primary tracking-tight whitespace-nowrap">{fmt(footerBill)}</p>
              </div>
              <div className="w-px h-6 bg-border mx-1" />
              <div className="flex flex-col">
                <p className="text-[8px] text-text-muted font-black uppercase tracking-widest mb-0.5">Paid</p>
                <p className="text-xs font-black text-success tracking-tight whitespace-nowrap">{fmt(footerCollected)}</p>
              </div>
              <div className="w-px h-6 bg-border mx-1" />
              <div className="flex flex-col">
                <p className="text-[8px] text-text-muted font-black uppercase tracking-widest mb-0.5">Due</p>
                <p className={`text-xs font-black tracking-tight whitespace-nowrap ${footerDue > 0 ? "text-warning" : "text-success"}`}>
                  {footerDue > 0 ? fmt(footerDue) : "Rs. 0"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-shrink-0">
              <button
                onClick={() => handleA4Print()}
                className="flex items-center gap-2 px-4 py-2 border border-border hover:bg-surface-hover text-text-secondary hover:text-text-primary rounded-lg text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer"
              >
                Full Bill
              </button>
              <button
                onClick={() => handleThermalPrint()}
                className="flex items-center gap-2.5 px-5 py-2 bg-primary text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-primary/20 hover:bg-primary-hover hover:-translate-y-0.5 active:scale-95 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" /> Thermal
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4 bg-background border border-border rounded-full h-2 overflow-hidden shadow-inner print:hidden">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${footerBill > 0 ? Math.min(100, (footerCollected / footerBill) * 100) : 0}%`,
                backgroundColor: footerCollected >= footerBill && footerBill > 0 ? "var(--success)" : "var(--primary)",
              }}
            />
          </div>

          {/* Print-only signature line */}
          <div className="hidden print:block pt-12 mt-8 text-center border-t border-border">
            <p className="text-xs text-text-muted uppercase tracking-widest font-black">Authorized Signature</p>
          </div>
        </div>
      </div>
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        {thermalFee && <ThermalBill ref={printRef} fee={thermalFee} settings={settings} />}
        {activeFee && <A4Bill ref={printRefA4} fee={activeFee} settings={settings} />}
      </div>
    </div>
  );
};

export default FeeViewModal;