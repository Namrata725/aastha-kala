"use client";

import React, { useMemo } from "react";
import {
  X, User, CreditCard, Calendar, Printer,
  CheckCircle2, Clock, Wallet, Info, Receipt, Layers,
  Banknote, Building, Smartphone, FileText, BookOpen
} from "lucide-react";

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
function fmt(n: number) { return "₹" + Math.round(n).toLocaleString("en-IN"); }
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
  if (!isOpen || !fee) return null;

  const isIntegrated = fee.fee_type === "billing";
  const methodInfo = METHOD_MAP[fee.payment_method] || METHOD_MAP["Cash"];
  const MethodIcon = methodInfo.icon;

  /* ── Parse admission ─────────────────────────────────── */
  const adm = useMemo(() => {
    const base = Number(fee.admission_fee) || 0;
    const disc = Number(fee.admission_discount) || 0;
    const discType = (fee.admission_discount_type as "cash" | "percentage") || "cash";
    const net = calcNet(base, disc, discType);
    const totalPaid = Number(fee.admission_paid_amount) || 0;
    const remaining = net - totalPaid;
    return { base, disc, discType, net, totalPaid, remaining, exists: base > 0 };
  }, [fee]);

  /* ── Parse programs ──────────────────────────────────── */
  const programs = useMemo<ProgramItem[]>(() => {
    // Rich breakdown from server (same shape as fee-info endpoint)
    if (fee.programs_breakdown && Array.isArray(fee.programs_breakdown)) {
      return fee.programs_breakdown.map((pb: any) => {
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
    if (fee.program_payments && typeof fee.program_payments === "object") {
      const discounts: Record<string, any> = fee.program_discounts || {};
      const progList: any[] = fee.programs || fee.selected_programs_details || [];
      return Object.entries(fee.program_payments).map(([id, paid]) => {
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
    if (Number(fee.program_fee) > 0) {
      const base = Number(fee.program_fee);
      const disc = Number(fee.program_discount) || 0;
      const discType = (fee.program_discount_type as "cash" | "percentage") || "cash";
      const net = calcNet(base, disc, discType);
      // Can't split paid_amount per-item in legacy mode, show net as paid if fully paid
      const isPaid = Number(fee.pending_amount || 0) <= 0;
      return [{ id: 0, title: "Program Fee", base, disc, discType, net, totalPaid: isPaid ? net : 0, remaining: isPaid ? 0 : net }];
    }
    return [];
  }, [fee]);

  /* ── Aggregate totals (from items) ───────────────────── */
  const itemTotals = useMemo(() => {
    const baseSum = (adm.exists ? adm.base : 0) + programs.reduce((a: number, c: ProgramItem) => a + c.base, 0);
    const netSum = (adm.exists ? adm.net : 0) + programs.reduce((a: number, c: ProgramItem) => a + c.net, 0);
    const paidSum = (adm.exists ? adm.totalPaid : 0) + programs.reduce((a: number, c: ProgramItem) => a + c.totalPaid, 0);
    const discountSum = baseSum - netSum;
    return { baseSum, netSum, paidSum, discountSum };
  }, [adm, programs]);

  // Footer: prefer authoritative server values, fall back to item calculations
  const footerBill = Number(fee.total_amount) || itemTotals.netSum;
  const footerCollected = Number(fee.paid_amount) || itemTotals.paidSum;
  const serverPending = Number(fee.pending_amount);
  const footerDue = !isNaN(serverPending) ? serverPending : Math.max(0, footerBill - footerCollected);
  const footerCost = itemTotals.baseSum;
  const footerDiscount = footerCost - footerBill;

  const itemCount = (adm.exists ? 1 : 0) + programs.length;
  const paidCount = (adm.exists && adm.remaining <= 0 && adm.net > 0 ? 1 : 0)
    + programs.filter(p => p.remaining <= 0 && p.net > 0).length;
  const fullyPaid = paidCount === itemCount && itemCount > 0;

  const handlePrint = () => window.print();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4 font-sans" onClick={onClose}>
      <div
        className="bg-white w-full max-w-[780px] max-h-[93vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200"
        onClick={e => e.stopPropagation()}
        id="receipt-content"
      >
        {/* ── Header ────────────────────────────────────── */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white flex-shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gray-900 rounded-xl flex items-center justify-center">
              <Receipt className="w-[18px] h-[18px] text-white" />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-gray-900">Payment Receipt</h2>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Ref: #TRS-{fee.id?.toString().padStart(6, "0")} ·{" "}
                {new Date(fee.created_at || Date.now()).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* ── Body ──────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-5">

            {/* Print-only branding */}
            <div className="hidden print:block text-center mb-6 border-b border-gray-200 pb-5">
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">AASTHA KALA KENDRA</h1>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Professional Arts Center</p>
              <div className="mt-2 flex justify-center gap-3 text-[9px] text-gray-400 uppercase tracking-widest">
                <span>Kathmandu, Nepal</span>
                <span>•</span>
                <span>+977 98XXXXXXXX</span>
              </div>
            </div>

            {/* Student card */}
            <div className="flex items-center gap-3.5 p-4 bg-gray-50 border border-gray-100 rounded-xl">
              <div className="w-11 h-11 rounded-xl bg-gray-900 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                {initials(fee.student?.name || fee.student_name || "??")}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{fee.student?.name || fee.student_name || "N/A"}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[11px] text-gray-400 font-medium">ID: #{fee.student_id}</span>
                  {fee.student?.classes && (
                    <span className="text-[11px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md font-medium">{fee.student.classes}</span>
                  )}
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${
                isIntegrated
                  ? "bg-violet-50 text-violet-700 border border-violet-100"
                  : fee.fee_type === "admission"
                    ? "bg-blue-50 text-blue-700 border border-blue-100"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-100"
              }`}>
                {isIntegrated ? "Integrated" : fee.fee_type === "admission" ? "Admission" : "Program"}
              </span>
            </div>

            {/* Meta row: Method · Period · Status */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 bg-white border border-gray-200 rounded-xl">
                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1.5 flex items-center gap-1.5">
                  <MethodIcon className="w-3 h-3" /> Method
                </p>
                <p className="text-[12px] font-semibold text-gray-900">{methodInfo.label}</p>
              </div>
              <div className="p-3.5 bg-white border border-gray-200 rounded-xl">
                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" /> Period
                </p>
                <p className="text-[12px] font-semibold text-gray-900 truncate">{fee.month_year || "—"}</p>
              </div>
              <div className="p-3.5 bg-white border border-gray-200 rounded-xl">
                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1.5 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3" /> Status
                </p>
                {fullyPaid ? (
                  <span className="text-[12px] font-bold text-emerald-600">Fully Paid</span>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-amber-500" />
                    <span className="text-[12px] font-semibold text-amber-600">Partially Paid</span>
                  </div>
                )}
              </div>
            </div>

            {/* ── Breakdown Table ────────────────────────── */}
            {itemCount > 0 && (
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
            )}

            {/* Pending balance callout */}
            {footerDue > 0 && (
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

            {/* Remarks */}
            {fee.remarks && (
              <div className="flex gap-3 px-1">
                <Info className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Remarks</p>
                  <p className="text-xs text-gray-600 mt-0.5">{fee.remarks}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Footer (mirrors FeeAddModal layout) ───────── */}
        <div className="px-6 py-4 border-t border-gray-100 bg-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Total Cost</p>
                <p className="text-lg font-extrabold text-gray-400 tracking-tight">{fmt(footerCost)}</p>
              </div>
              <div className="flex items-center text-gray-300 text-lg font-light">−</div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Discount</p>
                <p className="text-lg font-extrabold text-blue-500 tracking-tight">{fmt(footerDiscount)}</p>
              </div>
              <div className="flex items-center text-gray-300 text-lg font-light">=</div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Final Bill</p>
                <p className="text-lg font-extrabold text-gray-900 tracking-tight">{fmt(footerBill)}</p>
              </div>
              <div className="w-px h-9 bg-gray-100 mx-1" />
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Collected</p>
                <p className="text-lg font-extrabold text-emerald-600 tracking-tight">{fmt(footerCollected)}</p>
              </div>
              <div className="w-px h-9 bg-gray-100 mx-1" />
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Balance Due</p>
                <p className={`text-lg font-extrabold tracking-tight ${footerDue > 0 ? "text-amber-600" : "text-emerald-600"}`}>
                  {footerDue > 0 ? fmt(footerDue) : "—"}
                </p>
              </div>
            </div>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-black text-white rounded-xl text-[12px] font-bold transition-all shadow-lg shadow-gray-900/10 print:hidden"
            >
              <Printer className="w-3.5 h-3.5" /> Print
            </button>
          </div>

          {/* Progress bar */}
          <div className="mt-3 bg-gray-100 rounded-full h-1 overflow-hidden">
            <div
              className="h-1 rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${footerBill > 0 ? Math.min(100, (footerCollected / footerBill) * 100) : 0}%`,
                backgroundColor: footerCollected >= footerBill && footerBill > 0 ? "#10b981" : "#6366f1",
              }}
            />
          </div>

          {/* Print-only signature line */}
          <div className="hidden print:block pt-12 mt-4 text-center border-t border-gray-200">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Authorized Signature</p>
            <div className="w-48 h-[1px] bg-gray-400 mx-auto mt-8" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeeViewModal;