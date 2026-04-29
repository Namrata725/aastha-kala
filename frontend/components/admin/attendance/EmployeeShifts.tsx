"use client";

import React, { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { Save, UserCheck } from "lucide-react";
import { CustomSelect } from "@/components/ui/custom-select";

interface Shift {
  id: number;
  name: string;
  start_time: string;
  end_time: string;
}

interface Employee {
  id: number;
  name: string;
  type: string;
}

const DAYS_OF_WEEK = [
  { id: 0, name: "Sunday" },
  { id: 1, name: "Monday" },
  { id: 2, name: "Tuesday" },
  { id: 3, name: "Wednesday" },
  { id: 4, name: "Thursday" },
  { id: 5, name: "Friday" },
  { id: 6, name: "Saturday" },
];

const EmployeeShifts = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [assignments, setAssignments] = useState<{ shift_id: number; day_of_week: number }[]>([]);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
      
      const [empRes, shiftRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/all-employees`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/shifts`, { headers })
      ]);

      if (!empRes.ok || !shiftRes.ok) throw new Error("Failed to fetch initial data");

      const empData = await empRes.json();
      const shiftData = await shiftRes.json();

      setEmployees(empData.data || empData);
      setShifts(shiftData);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fetchEmployeeAssignments = async (employeeId: string) => {
    if (!employeeId) {
      setAssignments([]);
      return;
    }
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/shifts/employee/${employeeId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!res.ok) throw new Error("Failed to fetch assignments");
      const data = await res.json();
      
      const mapped = data.map((item: any) => ({
        shift_id: item.shift_id,
        day_of_week: item.day_of_week
      }));
      setAssignments(mapped);
    } catch (error: any) {
      toast.error("Could not load employee shifts.");
    }
  };

  const handleEmployeeChange = (val: string) => {
    setSelectedEmployeeId(val);
    fetchEmployeeAssignments(val);
  };

  const handleToggleShift = (dayId: number, shiftId: number) => {
    setAssignments((prev) => {
      const exists = prev.find(a => a.day_of_week === dayId && a.shift_id === shiftId);
      if (exists) {
        return prev.filter(a => !(a.day_of_week === dayId && a.shift_id === shiftId));
      } else {
        return [...prev, { day_of_week: dayId, shift_id: shiftId }];
      }
    });
  };

  const handleSave = async () => {
    if (!selectedEmployeeId) {
      toast.error("Please select an employee first.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/shifts/assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          employee_id: selectedEmployeeId,
          shifts: assignments,
          clear_existing: true
        }),
      });

      if (!res.ok) throw new Error("Failed to assign shifts");
      toast.success("Shifts successfully assigned to employee");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="py-12 flex justify-center"><Spinner size="lg" /></div>;
  }

  // Format time utility
  const ft = (t: string) => t ? t.substring(0, 5) : "";

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-6">
        <div className="max-w-md">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Employee</label>
          <CustomSelect
            value={selectedEmployeeId}
            onChange={handleEmployeeChange}
            options={[
              { value: "", label: "Select an employee..." },
              ...employees.map(e => ({
                value: String(e.id),
                label: `${e.name} (${e.type})`
              }))
            ]}
          />
        </div>

        {selectedEmployeeId ? (
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800">Weekly Schedule</h3>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {DAYS_OF_WEEK.map((day) => (
                <div key={day.id} className="border border-gray-200 rounded-lg overflow-hidden flex flex-col">
                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 font-semibold text-gray-700">
                    {day.name}
                  </div>
                  <div className="p-3 bg-white flex-1 space-y-2">
                    {shifts.length === 0 ? (
                      <p className="text-xs text-gray-400 italic">No shifts created yet.</p>
                    ) : (
                      shifts.map((shift) => {
                        const isSelected = assignments.some(a => a.day_of_week === day.id && a.shift_id === shift.id);
                        return (
                          <label key={shift.id} className="flex items-start gap-2 cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleShift(day.id, shift.id)}
                              className="mt-1 w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                            />
                            <div className="flex-1">
                              <p className={`text-sm font-medium transition-colors ${isSelected ? 'text-primary' : 'text-gray-700 group-hover:text-gray-900'}`}>
                                {shift.name}
                              </p>
                              <p className="text-xs text-gray-500 font-mono">
                                {ft(shift.start_time)} - {ft(shift.end_time)}
                              </p>
                            </div>
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6 flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all font-medium shadow-sm hover:shadow"
              >
                {saving ? <Spinner size="sm" /> : <Save className="w-4 h-4" />}
                Save Assignments
              </button>
            </div>
          </div>
        ) : (
          <div className="py-12 flex flex-col items-center justify-center text-gray-400 border border-dashed border-gray-200 rounded-lg bg-gray-50/50">
            <UserCheck className="w-12 h-12 mb-3 text-gray-300" />
            <p>Select an employee to manage their shift assignments.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeShifts;
