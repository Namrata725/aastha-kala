"use client";

import React, { useEffect, useState } from "react";
import { X, Plus, Trash2, Captions, FileTypeCorner, Wallet, Activity, Hash } from "lucide-react";
import toast from "react-hot-toast";
import InputField from "../layout/InputField";

interface Instructor {
  id: number;
  name: string;
}

interface Schedule {
  id?: number;
  instructor_id: string | number;
  start_time: string;
  end_time: string;
}

interface ProgramAddEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  program: any;
  onSuccess: () => void;
}


const ProgramAddEditModal: React.FC<ProgramAddEditModalProps> = ({
  isOpen,
  onClose,
  program,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [speciality, setSpeciality] = useState<string[]>([""]);
  const [isActive, setIsActive] = useState(true);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [programFee, setProgramFee] = useState("");
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (isOpen) {
      fetchInstructors();
      if (program) {
        setTitle(program.title || "");
        setDescription(program.description || "");
        setImagePreview(program.image || null);
        setSpeciality(program.speciality || [""]);
        setIsActive(program.is_active ?? true);
        setProgramFee(program.program_fee?.toString() ?? "");
        setSchedules(program.schedules?.map((s: any) => ({
          ...s,
          instructor_id: s.instructor_id ?? "",
          start_time: s.start_time?.substring(0, 5) || "",
          end_time: s.end_time?.substring(0, 5) || "",
        })) || []);
      } else {
        resetForm();
      }
      setErrors({});
    }
  }, [isOpen, program]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setImage(null);
    setImagePreview(null);
    setSpeciality([""]);
    setIsActive(true);
    setSchedules([]);
    setProgramFee("");
    setErrors({});
  };

  const fetchInstructors = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/instructors`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      setInstructors(data.data?.data || data.data || []);
    } catch (error) {
      console.error("Failed to fetch instructors", error);
    }
  };

  const addSpeciality = () => setSpeciality([...speciality, ""]);
  const removeSpeciality = (index: number) => {
    const newSpec = speciality.filter((_, i) => i !== index);
    setSpeciality(newSpec.length ? newSpec : [""]);
  };

  const addSchedule = () => {
    setSchedules([
      ...schedules,
      { start_time: "07:00", end_time: "08:00", instructor_id: "" },
    ]);
  };

  const removeSchedule = (index: number) => {
    const newSchedules = schedules.filter((_, i) => i !== index);
    setSchedules(newSchedules);
    
    // Re-evaluate conflicts for the new set of schedules to fix indexing issues
    setConflicts({});
    newSchedules.forEach((s, newIndex) => {
        if (s.instructor_id && s.start_time && s.end_time) {
            checkConflict(newIndex, s.instructor_id, s.start_time, s.end_time);
        }
    });
  };

  const [conflicts, setConflicts] = useState<{[key: number]: string}>({});

  const checkConflict = async (index: number, instructorId: string | number, start: string, end: string) => {
    if (loading) return;
    if (!instructorId || !start || !end) {
        setConflicts(prev => {
            const newConflicts = {...prev};
            delete newConflicts[index];
            return newConflicts;
        });
        return;
    }
    

    
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/instructors/${instructorId}/check-conflict?start_time=${start}&end_time=${end}${program?.id ? `&exclude_program_id=${program.id}` : ""}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await res.json();
        if (data.conflict) {
            setConflicts(prev => ({...prev, [index]: data.message}));
        } else {
            setConflicts(prev => {
                const newConflicts = {...prev};
                delete newConflicts[index];
                return newConflicts;
            });
        }
    } catch (error) {
        console.error("Conflict check failed", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (Object.keys(conflicts).length > 0) {
        toast.error("Please resolve any instructor scheduling conflicts before saving.");
        return;
    }

    // Check for duplicate/overlapping schedules within the form
    for (let i = 0; i < schedules.length; i++) {
        const s1 = schedules[i];
        if (!s1.instructor_id || !s1.start_time || !s1.end_time) continue;
        
        for (let j = i + 1; j < schedules.length; j++) {
            const s2 = schedules[j];
            if (!s2.instructor_id || !s2.start_time || !s2.end_time) continue;

            if (s1.instructor_id === s2.instructor_id) {
                if (s1.start_time < s2.end_time && s2.start_time < s1.end_time) {
                    toast.error("Multiple slots with overlapping times for the same instructor are not allowed.");
                    return;
                }
            }
        }
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("is_active", isActive ? "1" : "0");
    if (image) formData.append("image", image);
    if (programFee) formData.append("program_fee", programFee);
    
    speciality.forEach((s, i) => {
      if (s) formData.append(`speciality[${i}]`, s);
    });

    schedules.forEach((s, i) => {
      if (s.id) formData.append(`schedules[${i}][id]`, s.id.toString());
      formData.append(`schedules[${i}][start_time]`, s.start_time);
      formData.append(`schedules[${i}][end_time]`, s.end_time);
      if (s.instructor_id) formData.append(`schedules[${i}][instructor_id]`, s.instructor_id.toString());
    });

    try {
      const url = program
        ? `${process.env.NEXT_PUBLIC_API_URL}/admin/programs/${program.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/admin/programs`;
      
      const method = program ? "POST" : "POST";
      if (program) formData.append("_method", "PUT");

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: formData,
      });

      const data = await res.json();
      setErrors({});

      if (!res.ok) {
        if (data.errors) {
          setErrors(data.errors);
          
          // Scroll to the first error field
          const firstErrorKey = Object.keys(data.errors)[0];
          const elementId = firstErrorKey.replace(/\./g, "_");
          
          setTimeout(() => {
            const element = document.getElementById(elementId);
            if (element) {
              element.scrollIntoView({ behavior: "smooth", block: "center" });
            }
          }, 100);
          
          return;
        }
        throw new Error(data.message || "Failed to save program");
      }
      
      toast.success(program ? "Program updated" : "Program created");
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      // onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-lg cursor-pointer"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-[95vw] max-w-5xl max-h-[90vh] overflow-y-auto hide-scrollbar rounded-2xl p-8 bg-white/50 relative cursor-default"
        style={{
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-primary/50">
          <h2 className="text-xl font-bold text-primary italic">
            {program ? "Edit Program" : "Add New Program"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-primary/60 hover:text-primary transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <InputField
                label="Program Title"
                id="title"
                icon={Captions}
                required
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors(prev => ({ ...prev, title: [] }));
                }}
                disabled={loading}
                error={errors.title}
                placeholder="e.g. Vocal Training"
              />

              <InputField
                label="Description"
                id="description"
                icon={FileTypeCorner}
                textarea
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (errors.description) setErrors(prev => ({ ...prev, description: [] }));
                }}
                disabled={loading}
                error={errors.description}
                placeholder="Describe the program highlights..."
              />

              <div>
                <label className="block text-sm font-semibold text-primary mb-1 italic">Program Cover Image</label>
                <div className="mt-1 flex flex-col gap-4">
                  {imagePreview && (
                    <div className="relative w-full h-40 group overflow-hidden rounded-xl border border-primary/20 bg-white/40">
                       <img src={imagePreview} className="w-full h-full object-cover transition duration-500 group-hover:scale-110" />
                       <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                          <span className="text-xs font-bold uppercase tracking-widest text-white italic">Change Image</span>
                       </div>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setImage(file);
                        setImagePreview(URL.createObjectURL(file));
                      }
                    }}
                    className="text-xs text-primary/40 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-primary/20 file:text-primary hover:file:bg-primary/30 transition cursor-pointer \${loading ? 'cursor-not-allowed opacity-50' : ''}"

                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-primary/60 uppercase tracking-widest italic">Key Specialities</label>
                    <button type="button" onClick={loading ? undefined : addSpeciality} disabled={loading} className="text-[10px] bg-primary/20 text-primary px-3 py-1 rounded-full font-black uppercase hover:bg-primary/30 transition shadow-lg shadow-primary/10 tracking-tighter italic disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                    {loading ? '+ ...' : '+ Add Detail'}
                  </button>

                </div>
                <div className="space-y-2 max-h-80 overflow-y-auto pr-2 hide-scrollbar">
                  {speciality.map((s, index) => (
                    <div key={index} id={`speciality_${index}`} className="flex gap-2 group">
                      <InputField
                        label={`Detail ${index + 1}`}
                        icon={Hash}
                        value={s}
                        onChange={(e) => {
                          const newSpec = [...speciality];
                          newSpec[index] = e.target.value;
                          setSpeciality(newSpec);
                          if (errors[`speciality.${index}`]) {
                            setErrors(prev => ({ ...prev, [`speciality.${index}`]: [] }));
                          }
                        }}
                        disabled={loading}
                        error={errors[`speciality.${index}`]}
                        placeholder="e.g. Stage Performance Skills"
                      />

                      <button type="button" onClick={loading ? undefined : () => removeSpeciality(index)} disabled={loading} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition mt-6 disabled:opacity-30 disabled:cursor-not-allowed">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fee Settings */}
              <div className="bg-white/60 border border-primary/20 rounded-xl p-4 space-y-3">
                <InputField
                  label="Program Fee"
                  icon={Wallet}
                  type="number"
                  value={programFee}
                  onChange={(e) => {
                    setProgramFee(e.target.value);
                    if (errors.program_fee) setErrors(prev => ({ ...prev, program_fee: [] }));
                  }}
                  disabled={loading}
                  error={errors.program_fee}
                  placeholder="e.g. 2000"
                />
              </div>

              <div className="flex items-center gap-3 bg-white/40 p-4 rounded-xl border border-primary/20 group cursor-pointer hover:border-primary transition shadow-sm" onClick={loading ? undefined : () => setIsActive(!isActive)}>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => { if (!loading) setIsActive(e.target.checked); }}
                  disabled={loading}
                  className="w-5 h-5 accent-primary cursor-pointer disabled:cursor-not-allowed"
                />

                <div className="flex flex-col">
                   <label className="text-sm font-bold text-primary cursor-pointer italic">Live / Active</label>
                   {/* <span className="text-[10px] text-primary/60 uppercase font-medium italic">Allow students to see and book this program</span> */}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-primary/20 pt-8 mt-4">
            <div className="flex justify-between items-center mb-6">
               <div className="flex flex-col">
                  <h3 className="text-lg font-bold text-primary tracking-tight italic flex items-center gap-2">
                    Fixed Schedules
                  </h3>
                  {/* <span className="text-[10px] text-primary/60 uppercase font-black tracking-widest italic">Assign specific slots to specific teachers</span> */}
               </div>
                <button type="button" onClick={loading ? undefined : addSchedule} disabled={loading} className="flex items-center gap-2 text-[10px] bg-linear-to-r from-primary to-secondary text-white px-4 py-2 rounded-lg font-black uppercase hover:opacity-90 transition active:scale-95 shadow-xl shadow-primary/10 tracking-widest italic cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                  <Plus className="w-4 h-4 " /> {loading ? '...' : 'Add Slot'}
               </button>

            </div>

            <div className="space-y-4">
              {schedules.map((s, index) => (
                <div key={index} id={`schedules_${index}`} className="grid grid-cols-1 sm:grid-cols-7 gap-4 p-5 bg-white/40 rounded-2xl border border-primary/20 group hover:border-primary/40 transition relative overflow-hidden shadow-sm">
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-black uppercase text-primary/40 block mb-2 tracking-widest italic">Start Time</label>
                    <input
                      type="time"
                      value={s.start_time}
                      onChange={(e) => {
                        if (loading) return;
                        const newS = [...schedules];
                        newS[index].start_time = e.target.value;
                        setSchedules(newS);
                        checkConflict(index, newS[index].instructor_id, e.target.value, s.end_time);
                      }}
                      disabled={loading}
                      className="w-full bg-white/60 border border-primary/20 rounded-lg px-3 py-2 text-xs text-primary focus:outline-none focus:border-primary transition font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                    />

                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-black uppercase text-primary/40 block mb-2 tracking-widest italic">End Time</label>
                    <input
                      type="time"
                      value={s.end_time}
                      onChange={(e) => {
                        if (loading) return;
                        const newS = [...schedules];
                        newS[index].end_time = e.target.value;
                        setSchedules(newS);
                        checkConflict(index, newS[index].instructor_id, s.start_time, e.target.value);
                      }}
                      disabled={loading}
                      className="w-full bg-white/60 border border-primary/20 rounded-lg px-3 py-2 text-xs text-primary focus:outline-none focus:border-primary transition font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                    />

                  </div>
                  <div className="sm:col-span-3 flex items-end gap-3">
                    <div className="flex-1">
                      <label className="text-[10px] font-black uppercase text-primary/40 block mb-2 tracking-widest italic">Lead Instructor</label>
                      <select
                        value={s.instructor_id}
                        onChange={(e) => {
                          if (loading) return;
                          const newS = [...schedules];
                          newS[index].instructor_id = e.target.value;
                          setSchedules(newS);
                          checkConflict(index, e.target.value, s.start_time, s.end_time);
                        }}
                        disabled={loading}
                        className={`w-full bg-white/60 border rounded-lg px-3 py-2 text-xs text-primary focus:outline-none focus:border-primary transition cursor-pointer appearance-none font-bold italic disabled:opacity-50 disabled:cursor-not-allowed ${conflicts[index] ? 'border-red-500/50' : 'border-primary/20'}`}
                      >

                        <option value="">Select Instructor</option>
                        {instructors.map(inst => <option key={inst.id} value={inst.id}>{inst.name}</option>)}
                      </select>
                      {conflicts[index] && <p className="text-[9px] text-red-500 mt-1 font-medium">{conflicts[index]}</p>}
                    </div>
                    <button type="button" onClick={loading ? undefined : () => removeSchedule(index)} disabled={loading} className="p-2 text-red-500/60 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition group-hover:opacity-100 disabled:opacity-30 disabled:cursor-not-allowed">
                        <Trash2 className="w-5 h-5 px-1 cursor-pointer" />
                      </button>

                  </div>
                </div>
              ))}
              {schedules.length === 0 && (
                <div className="text-center py-10 border-2 border-dashed border-primary/20 rounded-3xl bg-white/20">
                   <span className="text-xs font-bold text-primary/20 uppercase tracking-widest italic">No fixed slots added yet</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-10 border-t border-primary/20 mt-6">
            <button type="button" onClick={onClose} className="px-8 py-3 rounded-xl text-primary/60 hover:text-primary hover:bg-white/40 border border-primary/10 transition font-bold uppercase tracking-widest text-[10px] italic cursor-pointer">Cancel</button>
            <button
              type="submit"
              disabled={loading}
              className="px-10 py-3 bg-linear-to-r from-primary to-secondary text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:opacity-90 transition active:scale-95 disabled:opacity-50 shadow-2xl shadow-primary/20 italic cursor-pointer"
            >
              {loading ? "Processing..." : (program ? "Update" : "Create")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProgramAddEditModal;
