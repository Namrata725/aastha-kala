"use client";

import React from "react";
import { X, User, Phone, MapPin, Mail, Calendar, Clock, BookOpen, Star, CreditCard } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  student: any;
}

const StudentViewModal: React.FC<Props> = ({ isOpen, onClose, student }) => {
  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 cursor-pointer" onClick={onClose}>
      <div className="bg-white w-full max-w-2xl rounded-[2rem] p-8 relative overflow-y-auto max-h-[90vh] cursor-default shadow-2xl transition-all" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute right-6 top-6 text-gray-400 hover:text-black transition-colors p-2 bg-gray-50 rounded-full">
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center mb-8">
            <div className="w-32 h-32 rounded-3xl bg-slate-100 overflow-hidden mb-4 border-4 border-white shadow-xl">
                {student.image_url ? (
                    <img src={student.image_url} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <User className="w-16 h-16 text-slate-300" />
                    </div>
                )}
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-1">{student.name}</h2>
            <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                student.status === 'active' ? 'bg-green-100 text-green-700' : 
                student.status === 'inactive' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
            }`}>
                {student.status}
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Personal Details</p>
                <DetailItem icon={Phone} label="Phone" value={student.phone} />
                <DetailItem icon={Mail} label="Email" value={student.email || "N/A"} />
                <DetailItem icon={MapPin} label="Address" value={student.address || "N/A"} />
                <DetailItem icon={Calendar} label="D.O.B" value={student.dob ? new Date(student.dob).toLocaleDateString() : "N/A"} />
                <DetailItem icon={Calendar} label="Enrollment Date" value={student.enrollment_date ? new Date(student.enrollment_date).toLocaleDateString() : "N/A"} />
            </div>
            <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Enrollment Info</p>
                <DetailItem icon={BookOpen} label="Enrolled In" value={student.classes || "N/A"} />
                <DetailItem icon={Clock} label="Preferred Time" value={student.time || "N/A"} />
                <DetailItem icon={Clock} label="Duration" value={student.duration_value ? `${student.duration_value} ${student.duration_unit}` : "N/A"} />
                <DetailItem icon={Star} label="Reference" value={student.offer_enroll_reference || "N/A"} />
                <DetailItem icon={User} label="Gender" value={student.gender || "N/A"} />
            </div>
        </div>

        {student.fees && student.fees.length > 0 && (
            <div className="mt-10">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Payment History</p>
                <div className="space-y-2">
                    {student.fees.map((fee: any) => (
                        <div key={fee.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="flex items-center">
                                <div className="p-2 bg-white rounded-xl mr-4">
                                    <CreditCard className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900 capitalize">{fee.fee_type} {fee.month_year && `(${fee.month_year})`}</p>
                                    <p className="text-[10px] text-gray-500">{new Date(fee.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-black text-gray-900">Rs. {fee.paid_amount}</p>
                                <span className={`text-[10px] font-bold uppercase ${fee.status === 'paid' ? 'text-green-600' : 'text-orange-600'}`}>
                                    {fee.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

const DetailItem = ({ icon: Icon, label, value }: { icon: any, label: string, value: string }) => (
    <div className="flex items-start">
        <div className="p-2 bg-blue-50 rounded-xl mr-3">
            <Icon className="w-4 h-4 text-blue-600" />
        </div>
        <div>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">{label}</p>
            <p className="text-sm font-bold text-gray-900">{value}</p>
        </div>
    </div>
);

export default StudentViewModal;
