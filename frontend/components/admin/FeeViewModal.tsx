"use client";

import React from "react";
import { 
    X, User, CreditCard, Calendar, DollarSign, Printer, Download, 
    CheckCircle2, Clock, Wallet, Info, Receipt, Layers
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  fee: any;
}

const FeeViewModal: React.FC<Props> = ({
  isOpen,
  onClose,
  fee,
}) => {
  if (!isOpen || !fee) return null;

  const handlePrint = () => {
    window.print();
  };

  const isIntegrated = fee.fee_type === 'billing';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4 cursor-pointer" onClick={onClose}>
      <div 
        className="bg-white w-full max-w-2xl rounded-2xl p-8 relative overflow-y-auto max-h-[90vh] cursor-default shadow-2xl transition-all border border-gray-200 flex flex-col" 
        onClick={(e) => e.stopPropagation()}
        id="receipt-content"
      >
        {/* Header - Hidden in Print */}
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100 print:hidden">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                    <Receipt className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900 leading-tight">
                        Billing Receipt
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">Ref: #TRS-{fee.id?.toString().padStart(6, '0')}</p>
                </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-900">
                <X className="w-5 h-5" />
            </button>
        </div>

        {/* Receipt Content */}
        <div className="space-y-6 flex-1">
            {/* Branding - Only for Print */}
            <div className="hidden print:block text-center mb-8 border-b border-gray-200 pb-6">
                <h1 className="text-3xl font-black text-gray-900">AASTHA KALA KENDRA</h1>
                <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Professional Arts Center</p>
                <div className="mt-3 flex justify-center gap-4 text-[10px] text-gray-400 uppercase tracking-widest">
                    <span>Kathmandu, Nepal</span>
                    <span>•</span>
                    <span>+977 98XXXXXXXX</span>
                </div>
            </div>

            <div className="flex justify-between items-start bg-gray-50 rounded-xl p-5 border border-gray-100">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Student</p>
                    <p className="text-lg font-bold text-gray-900 leading-none">{fee.student?.name || fee.student_name || "N/A"}</p>
                    <p className="text-xs text-gray-500 mt-1">ID: #{fee.student_id}</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Issue Date</p>
                    <p className="text-sm font-semibold text-gray-900">
                        {new Date(fee.created_at || Date.now()).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-xl border border-gray-200">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 flex items-center gap-1.5">
                        <Wallet className="w-3.5 h-3.5" /> Method
                    </p>
                    <p className="font-semibold text-gray-900 text-sm">{fee.payment_method || "Cash"}</p>
                </div>
                <div className="p-4 bg-white rounded-xl border border-gray-200">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5" /> Billing Type
                    </p>
                    <p className={`font-semibold text-sm ${isIntegrated ? 'text-secondary' : 'text-primary'}`}>
                        {isIntegrated ? 'Integrated (All-in)' : (fee.fee_type === 'admission' ? 'Admission' : 'Program')}
                    </p>
                </div>
            </div>

            <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Breakdown</p>
                <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                    <div className="flex justify-between px-5 py-3.5 bg-gray-50 border-b border-gray-200">
                        <span className="text-xs text-gray-500 font-medium">Description</span>
                        <span className="text-xs text-gray-500 font-medium">Amount</span>
                    </div>
                    {fee.month_year && (
                        <div className="flex justify-between px-5 py-3.5 bg-white border-b border-gray-100">
                            <span className="text-sm text-gray-600">Covering Period</span>
                            <span className="text-sm font-semibold text-gray-900">{fee.month_year}</span>
                        </div>
                    )}
                    {/* Admission Breakdown */}
                    {(fee.admission_fee > 0) && (
                        <div className="px-5 py-3.5 bg-white border-b border-gray-100 space-y-1">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Admission Fee</span>
                                <span className="text-sm font-medium text-gray-900">Rs. {Number(fee.admission_fee).toLocaleString()}</span>
                            </div>
                            {fee.admission_discount > 0 && (
                                <div className="flex justify-between text-xs mt-1">
                                    <span className="text-gray-400">Discount ({fee.admission_discount_type === 'percentage' ? `${fee.admission_discount}%` : `Rs. ${fee.admission_discount}`})</span>
                                    <span className="text-success font-medium">
                                        - Rs. {fee.admission_discount_type === 'percentage'
                                            ? ((Number(fee.admission_fee) * Number(fee.admission_discount)) / 100).toFixed(0)
                                            : Number(fee.admission_discount).toLocaleString()}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                    {/* Program Breakdown */}
                    {(fee.program_fee > 0) && (
                        <div className="px-5 py-3.5 bg-white border-b border-gray-100 space-y-1">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Program Fee</span>
                                <span className="text-sm font-medium text-gray-900">Rs. {Number(fee.program_fee).toLocaleString()}</span>
                            </div>
                            {fee.program_discount > 0 && (
                                <div className="flex justify-between text-xs mt-1">
                                    <span className="text-gray-400">Discount ({fee.program_discount_type === 'percentage' ? `${fee.program_discount}%` : `Rs. ${fee.program_discount}`})</span>
                                    <span className="text-success font-medium">
                                        - Rs. {fee.program_discount_type === 'percentage'
                                            ? ((Number(fee.program_fee) * Number(fee.program_discount)) / 100).toFixed(0)
                                            : Number(fee.program_discount).toLocaleString()}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                    <div className="flex justify-between px-5 py-4 bg-gray-50 border-b border-gray-200">
                        <span className="text-sm text-gray-900 font-bold">Total Bill Value</span>
                        <span className="text-sm font-bold text-gray-900">Rs. {Number(fee.total_amount).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between px-5 py-4 bg-gray-900">
                        <span className="text-sm text-success font-bold">Net Paid Amount</span>
                        <span className="text-lg font-black text-white">Rs. {Number(fee.paid_amount).toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {fee.pending_amount > 0 && (
                <div className="px-5 py-4 bg-warning/10 rounded-xl border border-warning/20 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white border border-warning/20 flex items-center justify-center">
                            <Clock className="w-4 h-4 text-warning" />
                        </div>
                        <div>
                            <span className="text-[10px] font-bold text-warning uppercase tracking-widest block">Balance Due</span>
                        </div>
                    </div>
                    <span className="text-xl font-bold text-warning">Rs. {Number(fee.pending_amount).toLocaleString()}</span>
                </div>
            )}

            {fee.remarks && (
                <div className="flex gap-3 px-1 mt-4">
                    <Info className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Remarks</p>
                        <p className="text-xs text-gray-600 mt-0.5">{fee.remarks}</p>
                    </div>
                </div>
            )}

            <div className="pt-6 mt-6 border-t border-gray-100 print:hidden">
                <button 
                    onClick={handlePrint}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-gray-900 hover:bg-black text-white rounded-xl font-bold text-sm transition-all"
                >
                    <Printer className="w-4 h-4" /> Print Receipt
                </button>
            </div>

            <div className="hidden print:block pt-16 mt-8 text-center border-t border-gray-200">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Authorized Signature</p>
                <div className="w-48 h-[1px] bg-gray-400 mx-auto mt-8"></div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default FeeViewModal;
