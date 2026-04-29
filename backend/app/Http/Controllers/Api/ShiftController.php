<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ShiftController extends Controller
{
    public function index()
    {
        $shifts = \App\Models\Shift::all();
        return response()->json($shifts);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i',
            'grace_period_minutes' => 'nullable|integer|min:0',
        ]);

        $shift = \App\Models\Shift::create($validated);
        return response()->json($shift, 201);
    }

    public function show(string $id)
    {
        $shift = \App\Models\Shift::findOrFail($id);
        return response()->json($shift);
    }

    public function update(Request $request, string $id)
    {
        $shift = \App\Models\Shift::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'start_time' => 'sometimes|required|date_format:H:i',
            'end_time' => 'sometimes|required|date_format:H:i',
            'grace_period_minutes' => 'nullable|integer|min:0',
        ]);

        $shift->update($validated);
        return response()->json($shift);
    }

    public function destroy(string $id)
    {
        $shift = \App\Models\Shift::findOrFail($id);
        $shift->delete();
        return response()->json(null, 204);
    }

    /**
     * Assign shifts to an employee
     */
    public function assignShifts(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'shifts' => 'required|array',
            'shifts.*.shift_id' => 'required|exists:shifts,id',
            'shifts.*.day_of_week' => 'required|integer|between:0,6',
        ]);

        $employeeId = $validated['employee_id'];
        
        // Optionally clear existing shifts or add to them
        if ($request->input('clear_existing', false)) {
            \App\Models\EmployeeShift::where('employee_id', $employeeId)->delete();
        }

        foreach ($validated['shifts'] as $shiftData) {
            \App\Models\EmployeeShift::updateOrCreate(
                [
                    'employee_id' => $employeeId,
                    'shift_id' => $shiftData['shift_id'],
                    'day_of_week' => $shiftData['day_of_week'],
                ]
            );
        }

        $employeeShifts = \App\Models\EmployeeShift::with('shift')
            ->where('employee_id', $employeeId)
            ->get();

        return response()->json($employeeShifts);
    }

    /**
     * Get shifts assigned to an employee
     */
    public function getEmployeeShifts(string $employeeId)
    {
        $shifts = \App\Models\EmployeeShift::with('shift')
            ->where('employee_id', $employeeId)
            ->get();
        return response()->json($shifts);
    }
}
