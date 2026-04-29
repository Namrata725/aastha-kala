"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AttendanceList from "@/components/admin/attendance/AttendanceList";
import ShiftList from "@/components/admin/attendance/ShiftList";
import EmployeeShifts from "@/components/admin/attendance/EmployeeShifts";
import { Clock, CalendarDays, Users } from "lucide-react";

const AttendancePage = () => {
  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage employee attendance, shifts, and daily records.</p>
        </div>

        <Tabs defaultValue="daily" className="w-full">
          <div className="overflow-x-auto pb-1 scrollbar-hide">
            <TabsList className="inline-flex w-auto min-w-full md:grid md:grid-cols-3 md:max-w-2xl bg-white border border-gray-200 shadow-sm p-1">
              <TabsTrigger value="daily" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white whitespace-nowrap px-4">
                <CalendarDays className="w-4 h-4 shrink-0" />
                Daily Attendance
              </TabsTrigger>
              <TabsTrigger value="shifts" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white whitespace-nowrap px-4">
                <Clock className="w-4 h-4 shrink-0" />
                Manage Shifts
              </TabsTrigger>
              <TabsTrigger value="assign" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white whitespace-nowrap px-4">
                <Users className="w-4 h-4 shrink-0" />
                Assign Shifts
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="mt-6">
            <TabsContent value="daily" className="outline-none m-0 p-0">
              <AttendanceList />
            </TabsContent>

            <TabsContent value="shifts" className="outline-none m-0 p-0">
              <ShiftList />
            </TabsContent>

            <TabsContent value="assign" className="outline-none m-0 p-0">
              <EmployeeShifts />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default AttendancePage;
