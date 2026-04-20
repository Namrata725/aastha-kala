"use client";

import React, { forwardRef } from "react";

interface ThermalBillProps {
  fee: any;
  settings: any;
}

export const ThermalBill = forwardRef<HTMLDivElement, ThermalBillProps>(
  ({ fee, settings }, ref) => {
    if (!fee) return null;

    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            @page {
              size: 80mm 297mm;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
            }
            .thermal-print-container {
              width: 80mm !important;
              padding: 10mm !important;
              margin: 0 !important;
              background: white !important;
              color: black !important;
            }
          }
        `}} />
        <div
          ref={ref}
          className="thermal-print-container bg-white text-black p-4 w-[80mm] mx-auto font-mono text-[11px] leading-snug print:block hidden"
          style={{ width: "80mm" }}
        >
        <div className="text-center space-y-1 mb-4 border-b border-dashed border-black pb-4">
          <h1 className="text-sm font-bold uppercase">{settings?.company_name || "Aastha Kala"}</h1>
          <p>{settings?.address || ""}</p>
          <p>Phone: {settings?.phone || ""}</p>
          <p>Email: {settings?.email || ""}</p>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between">
            <span>Bill No:</span>
            <span>#FEE-{fee.id}</span>
          </div>
          <div className="flex justify-between">
            <span>Date:</span>
            <span>{new Date().toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Student:</span>
            <span className="font-bold">{fee.student?.name}</span>
          </div>
          <div className="flex justify-between">
            <span>Period:</span>
            <span>{fee.month_year || "N/A"}</span>
          </div>
        </div>

        <div className="border-y border-dashed border-black py-2 mb-4">
          <div className="flex justify-between font-bold border-b border-dashed border-black pb-1 mb-1">
            <span>Description</span>
            <span>Amount</span>
          </div>
          <div className="flex justify-between pt-1">
            <span className="capitalize">{fee.fee_type} Fee</span>
            <span>Rs. {Number(fee.total_amount).toLocaleString()}</span>
          </div>
        </div>

        <div className="space-y-1 mb-6">
          <div className="flex justify-between text-[13px]">
            <span>Gross Total:</span>
            <span>Rs. {Number(fee.gross_amount).toLocaleString()}</span>
          </div>
          {Number(fee.discount_amount) > 0 && (
            <div className="flex justify-between text-[13px] text-gray-600 italic">
              <span>Total Discount:</span>
              <span>- Rs. {Number(fee.discount_amount).toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between text-[14px] border-t border-dashed border-black pt-1 mt-1">
            <span className="font-bold">Net Bill:</span>
            <span className="font-bold">Rs. {Number(fee.net_amount).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-success">
            <span className="font-bold text-black">Amount Paid:</span>
            <span className="font-bold">Rs. {Number(fee.paid_amount).toLocaleString()}</span>
          </div>

          {/* Individual Transactions Log */}
          {fee.payments && fee.payments.length > 0 && (
            <div className="mt-4 pt-4 border-t border-dotted border-black">
              <p className="text-center font-bold mb-2 uppercase text-[10px]">Payment History</p>
              {fee.payments
                .filter((p: any) => Number(p.paid_amount) > 0)
                .map((p: any, i: number) => (
                  <div key={i} className="flex justify-between text-[10px]">
                    <span>{new Date(p.created_at).toLocaleDateString()}</span>
                    <span>{p.payment_method}</span>
                    <span className="font-bold">{Number(p.paid_amount).toLocaleString()}</span>
                  </div>
                ))}
            </div>
          )}

          <div className="flex justify-between border-t border-dashed border-black pt-1 mt-4">
            <span className="font-bold uppercase">Balance Due:</span>
            <span className="font-bold text-red-600 text-[14px]">
              Rs. {Math.max(0, Number((fee.net_amount || fee.total_amount) - fee.paid_amount)).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="text-center space-y-2 pt-4 border-t border-dashed border-black">
          <p className="font-bold italic">Thank You!</p>
          <p className="text-[10px]">Aastha Kala - Center for Arts & Culture</p>
        </div>
      </div>
    </>
    );
  }
);

ThermalBill.displayName = "ThermalBill";
