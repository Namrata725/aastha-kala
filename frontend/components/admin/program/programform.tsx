'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import { 
  Plus, 
  Trash2, 
  Upload, 
  X,
  Clock,
  User,
  Wallet,
  Activity,
  AlertCircle,
  Hash,
  BookOpen,
  Captions,
  FileType,
  Layout,
  Layers,
  Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const IMAGE_BASE = process.env.NEXT_PUBLIC_IMAGE_URL;

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

interface SubProgram {
  id?: number;
  title: string;
  description?: string;
  program_fee: string;
  schedules: Schedule[];
}

// --- Sub-components ---

function ErrorMessage({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <motion.div 
      initial={{ opacity: 0, y: -5 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="flex items-center gap-1.5 text-red-500 text-[11px] font-medium mt-1 ml-1"
    >
      <AlertCircle className="size-3" />
      {message}
    </motion.div>
  );
}

function FieldLabel({ label, icon: Icon, required }: { label: string, icon?: any, required?: boolean }) {
  return (
    <div className="flex items-center gap-2 mb-1.5 ml-0.5">
      {Icon && <Icon className="size-3 text-muted-foreground/60" />}
      <span className="text-xs font-medium text-muted-foreground/90 tracking-tight">
        {label}
        {required && <span className="text-red-500/60 ml-0.5">*</span>}
      </span>
    </div>
  );
}

function MultiInput({ 
  label, 
  values, 
  onChange, 
  icon: Icon, 
  placeholder,
  error,
  required,
  className
}: { 
  label: string; 
  values: string[]; 
  onChange: (vals: string[]) => void; 
  icon: any;
  placeholder?: string;
  error?: string;
  required?: boolean;
  className?: string;
}) {
  const [inputValue, setInputValue] = React.useState("");

  const addTag = () => {
    if (inputValue.trim() && !values.includes(inputValue.trim())) {
      onChange([...values, inputValue.trim()]);
      setInputValue("");
    }
  };

  const removeTag = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  return (
    <div className={cn("space-y-1", className)}>
      <FieldLabel label={label} icon={Icon} required={required} />
      <div className="flex gap-2">
        <Input 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
          placeholder={placeholder}
          className={cn("h-10 rounded-xl bg-background border-border text-sm px-4", error && "border-red-400/40")}
        />
        <Button type="button" onClick={addTag} size="icon" className="shrink-0 rounded-xl h-10 w-10 bg-primary hover:bg-primary/90 text-white shadow-sm transition-transform active:scale-90 cursor-pointer">
          <Plus className="size-4" />
        </Button>
      </div>
      
      {values.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1.5 max-h-[60px] overflow-y-auto custom-scrollbar">
          <AnimatePresence>
            {values.filter(v => v).map((tag, i) => (
              <motion.div 
                key={`${tag}-${i}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-1 bg-muted/30 hover:bg-muted/50 text-foreground/60 px-2 py-0.5 rounded-lg text-[10px] font-medium border border-border group transition-all"
              >
                <span>{tag}</span>
                <button type="button" onClick={() => removeTag(i)} className="text-muted-foreground/30 hover:text-red-500 transition-colors">
                  <X className="size-2.5" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
      <ErrorMessage message={error} />
    </div>
  );
}

function ImageUpload({ 
  label, 
  value, 
  onChange,
  icon: Icon
}: { 
  label: string; 
  value: string | null; 
  onChange: (file: File | null) => void;
  icon?: any;
}) {
  const [preview, setPreview] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const getImageUrl = (val: string | null) => {
    if (!val) return null;
    if (val.startsWith('data:') || val.startsWith('blob:')) return val;
    if (val.startsWith('http')) return val;
    const base = IMAGE_BASE?.replace(/\/$/, "");
    const path = val.replace(/^\/+/, "").replace(/^storage\//, "");
    return `${base}/${path}`;
  };

  const displayImage = preview || getImageUrl(value);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-1">
      <FieldLabel label={label} icon={Icon} />
      <div 
        className="relative group cursor-pointer border border-dashed border-muted-foreground/20 rounded-xl overflow-hidden hover:border-primary/50 hover:bg-muted/30 transition-all w-full aspect-video flex items-center justify-center bg-muted/10 shadow-sm"
        onClick={() => fileInputRef.current?.click()}
      >
        {displayImage ? (
          <img src={displayImage} alt={label} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground/20 transition-colors group-hover:text-primary/40">
            <ImageIcon className="size-6" />
            <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/40">Cover Image</span>
          </div>
        )}
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
        {displayImage && (
          <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
            <div className="bg-white/90 text-primary px-3 py-1 rounded-lg text-[9px] font-medium shadow-lg">Change Image</div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Main Program Form ---

export function ProgramForm({ 
  initialData, 
  onSuccess,
  onCancel
}: { 
  initialData?: any,
  onSuccess: () => void,
  onCancel: () => void
}) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [instructors, setInstructors] = React.useState<Instructor[]>([]);
  
  // State
  const [title, setTitle] = React.useState(initialData?.title || "");
  const [description, setDescription] = React.useState(initialData?.description || "");
  const [programFee, setProgramFee] = React.useState(initialData?.program_fee || "");
  const [admissionFee, setAdmissionFee] = React.useState(initialData?.admission_fee || "");
  const [isActive, setIsActive] = React.useState(initialData?.is_active ?? true);
  const [speciality, setSpeciality] = React.useState<string[]>(initialData?.speciality || []);
  const [image, setImage] = React.useState<File | null>(null);
  const [schedules, setSchedules] = React.useState<Schedule[]>(initialData?.schedules?.map((s: any) => ({
    ...s,
    start_time: s.start_time?.substring(0, 5) || "",
    end_time: s.end_time?.substring(0, 5) || ""
  })) || []);
  const [subPrograms, setSubPrograms] = React.useState<SubProgram[]>(initialData?.sub_programs?.map((sp: any) => ({
    ...sp,
    schedules: sp.schedules?.map((s: any) => ({
      ...s,
      start_time: s.start_time?.substring(0, 5) || "",
      end_time: s.end_time?.substring(0, 5) || ""
    })) || []
  })) || []);

  const [errors, setErrors] = React.useState<Record<string, string[]>>({});
  const [conflicts, setConflicts] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    fetchInstructors();
  }, []);

  const fetchInstructors = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/instructors`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      setInstructors(data.data?.data || data.data || []);
    } catch (error) {
      console.error("Failed to fetch instructors", error);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    setErrors({});
    
    try {
      const formData = new FormData();
      if (initialData) formData.append('_method', 'PUT');
      
      formData.append('title', title);
      formData.append('description', description);
      formData.append('program_fee', programFee);
      if (admissionFee) formData.append('admission_fee', admissionFee);
      formData.append('is_active', isActive ? '1' : '0');
      
      speciality.forEach((s, i) => formData.append(`speciality[${i}]`, s));
      if (image) formData.append('image', image);
      
      schedules.forEach((s, i) => {
        if (s.id) formData.append(`schedules[${i}][id]`, s.id.toString());
        formData.append(`schedules[${i}][start_time]`, s.start_time);
        formData.append(`schedules[${i}][end_time]`, s.end_time);
        if (s.instructor_id) formData.append(`schedules[${i}][instructor_id]`, s.instructor_id.toString());
      });

      subPrograms.forEach((sp, i) => {
        if (sp.id) formData.append(`sub_programs[${i}][id]`, sp.id.toString());
        formData.append(`sub_programs[${i}][title]`, sp.title);
        if (sp.description) formData.append(`sub_programs[${i}][description]`, sp.description);
        formData.append(`sub_programs[${i}][program_fee]`, sp.program_fee);
        sp.schedules.forEach((s, j) => {
          if (s.id) formData.append(`sub_programs[${i}][schedules][${j}][id]`, s.id.toString());
          formData.append(`sub_programs[${i}][schedules][${j}][start_time]`, s.start_time);
          formData.append(`sub_programs[${i}][schedules][${j}][end_time]`, s.end_time);
          if (s.instructor_id) formData.append(`sub_programs[${i}][schedules][${j}][instructor_id]`, s.instructor_id.toString());
        });
      });

      const response = await fetch(`${API_URL}/admin/programs${initialData ? `/${initialData.id}` : ''}`, {
        method: 'POST',
        headers: { 
          'Accept': 'application/json', 
          'Authorization': `Bearer ${localStorage.getItem("token")}` 
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.errors) setErrors(errorData.errors);
        throw new Error(errorData.message || 'Operation failed');
      }

      toast.success(`Program ${initialData ? 'updated' : 'created'} successfully`);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const checkConflict = async (index: string, instructorId: string | number, start: string, end: string) => {
    if (!instructorId || !start || !end) {
      setConflicts(prev => { const next = {...prev}; delete next[index]; return next; });
      return;
    }
    try {
      const res = await fetch(`${API_URL}/admin/instructors/${instructorId}/check-conflict?start_time=${start}&end_time=${end}${initialData?.id ? `&exclude_program_id=${initialData.id}` : ""}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      if (data.conflict) {
        setConflicts(prev => ({ ...prev, [index]: data.message }));
      } else {
        setConflicts(prev => { const next = {...prev}; delete next[index]; return next; });
      }
    } catch (error) {}
  };

  const addSchedule = () => setSchedules([...schedules, { start_time: "07:00", end_time: "08:00", instructor_id: "" }]);
  const removeSchedule = (i: number) => setSchedules(schedules.filter((_, idx) => idx !== i));

  const addSubProgram = () => setSubPrograms([...subPrograms, { title: "", description: "", program_fee: "", schedules: [] }]);
  const removeSubProgram = (i: number) => setSubPrograms(subPrograms.filter((_, idx) => idx !== i));
  const addSubSchedule = (subIdx: number) => {
    const newSubs = [...subPrograms];
    newSubs[subIdx].schedules.push({ start_time: "07:00", end_time: "08:00", instructor_id: "" });
    setSubPrograms(newSubs);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 px-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground/90">{initialData ? 'Edit Program' : 'New Program'}</h1>
          <p className="text-xs text-muted-foreground/60 font-medium">Global Course Management System</p>
        </div>
      </div>

      <Card className="border border-border/50 shadow-sm bg-card rounded-2xl overflow-hidden">
        <CardHeader className="p-6 border-b border-border/10 bg-muted/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl text-primary shadow-sm"><Layout className="size-4.5" /></div>
            <CardTitle className="text-base font-bold text-foreground/80">Program Configuration</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Title & Description */}
            <div className="lg:col-span-8 space-y-6">
              <div className="space-y-1">
                <FieldLabel label="Program Title" icon={Captions} required />
                <Input 
                  value={title} 
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Classical Vocal"
                  className={cn("h-10 rounded-xl bg-background border-border text-sm px-4 placeholder:text-muted-foreground/60", errors.title && "border-red-400/40")}
                />
                <ErrorMessage message={errors.title?.[0]} />
              </div>
              <div className="space-y-1">
                <FieldLabel label="Description" icon={BookOpen} />
                <Textarea 
                  value={description} 
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Course curriculum and goals..."
                  className="min-h-[140px] rounded-xl bg-background p-4 text-sm resize-none border-border placeholder:text-muted-foreground/60"
                />
                <ErrorMessage message={errors.description?.[0]} />
              </div>
            </div>

            {/* Right Column: Banner Image */}
            <div className="lg:col-span-4">
              <ImageUpload label="Banner Media" value={initialData?.image} onChange={setImage} icon={Upload} />
            </div>
          </div>

          <div className="h-px bg-border/40" />

          {/* Row 2: Specialities, Monthly Fee, Admission Fee, Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
            <MultiInput 
              label="Specialities" 
              values={speciality} 
              onChange={setSpeciality} 
              icon={Hash} 
              placeholder="Add tag..." 
              className="lg:col-span-1"
            />

            <div className="space-y-1">
              <FieldLabel label="Monthly Fee" icon={Wallet} required />
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 text-[10px] font-bold tracking-tighter italic">RS</span>
                <Input 
                  type="number" 
                  value={programFee} 
                  onChange={e => setProgramFee(e.target.value)}
                  className="h-10 pl-11 rounded-xl bg-background border-border text-sm font-medium"
                />
              </div>
              <ErrorMessage message={errors.program_fee?.[0]} />
            </div>

            <div className="space-y-1">
              <FieldLabel label="Admission Fee" icon={Wallet} />
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 text-[10px] font-bold tracking-tighter italic">RS</span>
                <Input 
                  type="number" 
                  value={admissionFee} 
                  onChange={e => setAdmissionFee(e.target.value)}
                  className="h-10 pl-11 rounded-xl bg-background border-border text-sm font-medium"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 bg-primary/5 p-3 rounded-xl border border-primary/10 h-10 mt-7">
              <Activity className={cn("size-3.5", isActive ? "text-primary" : "text-muted-foreground/40")} />
              <div className="flex-1">
                <p className="text-[11px] font-medium text-muted-foreground/90 leading-none">Catalog Status</p>
                <p className="text-[9px] text-muted-foreground/40 font-medium leading-none mt-1">{isActive ? 'Public' : 'Hidden'}</p>
              </div>
              <button 
                type="button" 
                onClick={() => setIsActive(!isActive)}
                className={cn(
                  "w-8 h-4 rounded-full transition-colors relative shrink-0",
                  isActive ? "bg-primary" : "bg-muted-foreground/30"
                )}
              >
                <motion.div 
                  animate={{ x: isActive ? 18 : 2 }}
                  className="w-3 h-3 bg-white rounded-full absolute top-0.5 shadow-sm"
                />
              </button>
            </div>
          </div>

          <div className="h-px bg-border/40" />

          {/* Schedules Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-primary/10 rounded-xl text-primary"><Clock className="size-4" /></div>
                <h3 className="text-sm font-medium text-muted-foreground/90">Program Slots</h3>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addSchedule} className="h-8 rounded-lg gap-1.5 text-[10px] font-bold border-primary/20 text-primary hover:bg-primary/5">
                <Plus className="size-3" /> Add Slot
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {schedules.map((s, i) => (
                <div key={i} className="flex flex-col sm:flex-row gap-3 p-3 bg-muted/5 rounded-xl border border-border/40 relative group">
                  <div className="flex-1 grid grid-cols-2 gap-3">
                    <Input type="time" value={s.start_time} onChange={e => {
                      const next = [...schedules]; next[i].start_time = e.target.value; setSchedules(next);
                      checkConflict(`main_${i}`, s.instructor_id, e.target.value, s.end_time);
                    }} className="h-9 rounded-lg bg-background text-xs" />
                    <Input type="time" value={s.end_time} onChange={e => {
                      const next = [...schedules]; next[i].end_time = e.target.value; setSchedules(next);
                      checkConflict(`main_${i}`, s.instructor_id, s.start_time, e.target.value);
                    }} className="h-9 rounded-lg bg-background text-xs" />
                  </div>
                  <div className="flex-[2]">
                    <select value={s.instructor_id} onChange={e => {
                      const next = [...schedules]; next[i].instructor_id = e.target.value; setSchedules(next);
                      checkConflict(`main_${i}`, e.target.value, s.start_time, s.end_time);
                    }} className="w-full h-9 rounded-lg bg-background border border-border px-3 text-xs font-medium appearance-none text-muted-foreground/90">
                      <option value="">Select Instructor</option>
                      {instructors.map(inst => <option key={inst.id} value={inst.id}>{inst.name}</option>)}
                    </select>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeSchedule(i)} className="h-9 w-9 text-muted-foreground/30 hover:text-red-500 transition-colors">
                    <Trash2 className="size-3.5" />
                  </Button>
                  {conflicts[`main_${i}`] && <div className="absolute -bottom-2 left-6 bg-red-500 text-white text-[8px] px-2 py-0.5 rounded shadow-sm font-medium">{conflicts[`main_${i}`]}</div>}
                </div>
              ))}
              {schedules.length === 0 && (
                <div className="text-center py-6 border border-dashed border-border/40 rounded-xl text-muted-foreground/30 text-[10px] font-medium tracking-widest uppercase">
                  Timeline Empty
                </div>
              )}
            </div>
          </div>

          <div className="h-px bg-border/40" />

          {/* Sub Programs Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-primary/10 rounded-xl text-primary"><Layers className="size-4" /></div>
                <h3 className="text-sm font-medium text-muted-foreground/90">Sub Programs</h3>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addSubProgram} className="h-8 rounded-lg gap-1.5 text-[10px] font-bold border-primary/20 text-primary hover:bg-primary/5">
                <Plus className="size-3" /> Add Sub
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {subPrograms.map((sp, i) => (
                <div key={i} className="p-5 bg-muted/5 rounded-xl border border-border/40 relative space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-1">
                       <FieldLabel label="Sub Title" />
                       <Input value={sp.title} onChange={e => { const next = [...subPrograms]; next[i].title = e.target.value; setSubPrograms(next); }} placeholder="e.g. Evening" className="h-9 bg-background text-xs placeholder:text-muted-foreground/60" />
                    </div>
                    <div className="space-y-1">
                       <FieldLabel label="Sub Fee" />
                       <Input type="number" value={sp.program_fee} onChange={e => { const next = [...subPrograms]; next[i].program_fee = e.target.value; setSubPrograms(next); }} placeholder="Fee amount" className="h-9 bg-background text-xs font-medium placeholder:text-muted-foreground/60" />
                    </div>
                    <div className="space-y-1 lg:col-span-1">
                       <FieldLabel label="Sub Description" />
                       <Input 
                          value={sp.description} 
                          onChange={e => { const next = [...subPrograms]; next[i].description = e.target.value; setSubPrograms(next); }} 
                          placeholder="Short details..." 
                          className="h-9 bg-background text-xs placeholder:text-muted-foreground/60" 
                       />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center px-0.5">
                      <p className="text-[10px] font-medium text-muted-foreground/40 tracking-tight italic">Batch Slots</p>
                      <button type="button" onClick={() => addSubSchedule(i)} className="text-[10px] font-bold text-primary/60 hover:text-primary transition-colors">+ Add Slot</button>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {sp.schedules.map((s, si) => (
                        <div key={si} className="flex gap-2 bg-background/50 p-1.5 rounded-lg border border-border/20 shadow-sm">
                          <Input type="time" value={s.start_time} onChange={e => { const next = [...subPrograms]; next[i].schedules[si].start_time = e.target.value; setSubPrograms(next); }} className="h-8 text-[10px] w-24" />
                          <Input type="time" value={s.end_time} onChange={e => { const next = [...subPrograms]; next[i].schedules[si].end_time = e.target.value; setSubPrograms(next); }} className="h-8 text-[10px] w-24" />
                          <select value={s.instructor_id} onChange={e => { const next = [...subPrograms]; next[i].schedules[si].instructor_id = e.target.value; setSubPrograms(next); }} className="h-8 rounded-md bg-background border border-border px-2 text-[10px] flex-1 appearance-none text-muted-foreground/90">
                            <option value="">Instructor</option>
                            {instructors.map(inst => <option key={inst.id} value={inst.id}>{inst.name}</option>)}
                          </select>
                          <button type="button" onClick={() => { const next = [...subPrograms]; next[i].schedules = next[i].schedules.filter((_, idx) => idx !== si); setSubPrograms(next); }} className="text-muted-foreground/30 hover:text-red-500 p-1 transition-colors">
                            <Trash2 className="size-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button type="button" onClick={() => removeSubProgram(i)} className="absolute top-4 right-4 text-muted-foreground/20 hover:text-red-500 transition-colors">
                    <X className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-6 border-t border-border/10 bg-muted/5 flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel} className="px-6 h-10 rounded-xl text-xs font-semibold">Cancel</Button>
          <Button 
            onClick={handleSave} 
            disabled={isLoading} 
            className="px-8 h-10 rounded-xl bg-primary hover:bg-primary/90 text-white shadow-sm text-xs font-semibold"
          >
            {isLoading ? <Spinner size="sm" className="mr-2" /> : initialData ? 'Update Program' : 'Create Program'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
