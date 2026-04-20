"use client";

import React, { forwardRef } from "react";

interface A4BillProps {
  fee: any;
  settings: any;
}

export const A4Bill = forwardRef<HTMLDivElement, A4BillProps>(({ fee, settings }, ref) => {
  if (!fee) return null;

  const fmt = (n: number) => "Rs. " + Math.round(n).toLocaleString("en-IN");
  
  // Calculate breakdown totals
  const totalGross = Number(fee.gross_amount || 0);
  const totalDiscount = Number(fee.discount_amount || 0);
  const netBill = Number(fee.net_amount || 0);
  const paidAmount = Number(fee.paid_amount || 0);
  const balanceDue = Math.max(0, netBill - paidAmount);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * { visibility: hidden !important; }
          .a4-bill-container, .a4-bill-container * { visibility: visible !important; }
          .a4-bill-container {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 210mm !important;
            min-height: 297mm !important;
            padding: 20mm !important;
            display: block !important;
            background: white !important;
          }
           @page {
            size: A4;
            margin: 0;
          }
        }
      `}} />
      <div ref={ref} className="a4-bill-container bg-white text-black p-10 max-w-[210mm] min-h-[297mm] mx-auto font-serif hidden print:block border-[3px] border-black">
        {/* Unified Table Structure */}
        <table className="w-full border-collapse">
          <tbody>
            {/* Header / Brand Row */}
            <tr>
              <td colSpan={3} className="p-6 border-b-2 border-black">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-4xl font-bold uppercase tracking-tight">{settings?.company_name || "Aastha Kala"}</h1>
                    <p className="text-[10px] font-bold uppercase tracking-[0.4em] mt-1">Center for Arts & Culture</p>
                  </div>
                  <div className="text-right border-2 border-black p-4">
                    <p className="text-[11px] font-bold uppercase">Official Receipt</p>
                    <p className="text-2xl font-bold">#FEE-{fee.id}</p>
                  </div>
                </div>
              </td>
            </tr>

            {/* School & Date Info Row */}
            <tr className="border-b-2 border-black">
              <td className="p-4 border-r-2 border-black w-1/2">
                <p className="text-[10px] font-bold uppercase text-gray-500 mb-1">Provider Details</p>
                <div className="text-[11px] font-bold space-y-0.5">
                  <p>{settings?.address}</p>
                  <p>TEL: {settings?.phone}</p>
                  <p>EMAIL: {settings?.email}</p>
                </div>
              </td>
              <td colSpan={2} className="p-4 align-top">
                <p className="text-[10px] font-bold uppercase text-gray-500 mb-1">Billing Reference</p>
                <div className="text-[11px] font-bold space-y-0.5">
                  <p>DATE OF ISSUE: {new Date().toLocaleDateString('en-GB')}</p>
                  <p>BILLING PERIOD: {fee.month_year}</p>
                </div>
              </td>
            </tr>

            {/* Student Info Row */}
            <tr className="border-b-2 border-black">
              <td className="p-4 border-r-2 border-black">
                <p className="text-[10px] font-bold uppercase text-gray-500 mb-1">Billed To (Student)</p>
                <p className="text-xl font-bold uppercase underline underline-offset-4">{fee.student?.name}</p>
                <p className="text-[11px] font-bold mt-2 uppercase tracking-tighter">{fee.student?.classes || "General Enrollment"}</p>
                <p className="text-[11px] font-bold mt-1">CONTACT: {fee.student?.phone || "N/A"}</p>
              </td>
              <td colSpan={2} className="p-4 align-top">
                <p className="text-[10px] font-bold uppercase text-gray-500 mb-1">Payment Attributes</p>
                <div className="text-[11px] font-bold space-y-1 mt-1">
                  <div className="flex justify-between">
                     <span>METHOD:</span>
                     <span className="uppercase">{fee.payment_method || "CASH"}</span>
                  </div>
                  <div className="flex justify-between">
                     <span>SETTLEMENT:</span>
                     <span className="uppercase">{balanceDue <= 0 ? 'COMPLETED' : 'PENDING BALANCE'}</span>
                  </div>
                </div>
              </td>
            </tr>

            {/* Breakdown Header */}
            <tr className="bg-gray-100 border-b-2 border-black">
              <td className="px-6 py-3 font-black uppercase text-xs tracking-widest text-left">Description of Services</td>
              <td className="px-6 py-3 font-black uppercase text-xs tracking-widest text-right w-32 border-l-2 border-black">Assessments</td>
              <td className="px-6 py-3 font-black uppercase text-xs tracking-widest text-right w-40 border-l-2 border-black">Amount</td>
            </tr>

            {/* Breakdown Body */}
            <tr className="border-b-2 border-black min-h-[150px]">
              <td className="p-6 align-top border-r-2 border-black h-48">
                <p className="text-lg font-bold uppercase">{fee.fee_type === 'billing' ? 'Tuition & Admission Assessment' : fee.fee_type + ' Assessment'}</p>
                <p className="text-[10px] font-medium mt-1 uppercase text-gray-400 leading-relaxed italic">Standard period fee for specialized curriculum and administration.</p>
                {fee.remarks && (
                  <div className="mt-8 border-l-2 border-black pl-3 py-1">
                    <p className="text-[9px] font-black uppercase text-gray-400">Internal Reference:</p>
                    <p className="text-[11px] font-bold italic">{fee.remarks}</p>
                  </div>
                )}
              </td>
              <td className="p-6 align-top border-r-2 border-black text-right space-y-1">
                 <div className="flex justify-between text-[11px] font-bold">
                    <span>GROSS:</span>
                    <span>{fmt(totalGross)}</span>
                 </div>
                 <div className="flex justify-between text-[11px] font-bold text-gray-500">
                    <span>DISC:</span>
                    <span>({fmt(totalDiscount)})</span>
                 </div>
              </td>
              <td className="p-6 align-top text-right">
                 <p className="text-2xl font-black">{fmt(netBill)}</p>
              </td>
            </tr>

            {/* Payment History In-Table */}
            {fee.payments && fee.payments.filter((p: any) => Number(p.paid_amount) > 0).length > 0 && (
              <tr className="border-b-2 border-black">
                <td colSpan={3} className="p-0">
                  <table className="w-full text-[10px] font-bold">
                    <thead>
                      <tr className="bg-gray-50 border-b border-black">
                        <th className="text-left px-6 py-1 uppercase underline">Payment Date</th>
                        <th className="text-left px-6 py-1 uppercase underline">Transaction Method</th>
                        <th className="text-right px-6 py-1 uppercase underline">Net Received</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fee.payments.filter((p: any) => Number(p.paid_amount) > 0).map((p: any, idx: number) => (
                        <tr key={idx} className="border-b border-gray-100 last:border-0 uppercase">
                          <td className="px-6 py-2">{new Date(p.created_at).toLocaleDateString()}</td>
                          <td className="px-6 py-2">{p.payment_method}</td>
                          <td className="px-6 py-2 text-right font-black">{fmt(p.paid_amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </td>
              </tr>
            )}

            {/* Financial Summary Controls */}
            <tr>
              <td rowSpan={3} className="p-8 border-r-2 border-black align-top">
                 <div className="space-y-4">
                    <p className="text-[10px] font-black tracking-widest uppercase mb-4">Official Verification</p>
                    <div className="h-24 w-full border border-dashed border-gray-300 flex items-center justify-center text-[10px] font-bold text-gray-300 uppercase">
                       [ Administrative Stamp Space ]
                    </div>
                    <div className="pt-4 border-t border-black text-center mt-8">
                       <p className="text-[11px] font-black uppercase tracking-tighter">Authorized Registrar</p>
                    </div>
                 </div>
              </td>
              <td className="px-6 py-4 bg-gray-50 border-b-2 border-black font-bold text-[11px] uppercase">Amount Received</td>
              <td className="px-6 py-4 bg-gray-50 border-b-2 border-black font-bold text-right text-lg">{fmt(paidAmount)}</td>
            </tr>
            <tr className="bg-black text-white">
              <td className="px-6 py-6 font-black uppercase text-xs tracking-[0.2em]">Total Balance Due</td>
              <td className="px-6 py-6 font-black text-right text-2xl underline underline-offset-8">{fmt(balanceDue)}</td>
            </tr>
            <tr>
              <td colSpan={2} className="p-4 align-top">
                 <p className="text-[8px] font-black uppercase leading-tight text-gray-400">
                    This document is a formal assessment of student financial liabilities. 
                    Late payments may attract administrative penalties. All figures are in Nepali Rupees.
                 </p>
              </td>
            </tr>
          </tbody>
        </table>
        
        {/* Footnote outside main table */}
        <p className="text-center text-[9px] font-bold uppercase tracking-widest mt-6 opacity-30 italic">Generated Secured Document • Aastha Kala Management System</p>
      </div>
    </>
    
  );
});

A4Bill.displayName = "A4Bill";
