<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SalaryPayment;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SalaryPaymentController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', SalaryPayment::class);

        $query = SalaryPayment::with('employee');

        if ($request->has('employee_id')) {
            $query->where('employee_id', $request->employee_id);
        }

        if ($request->has('month')) {
            $query->where('month', $request->month);
        }

        if ($request->has('year')) {
            $query->where('year', $request->year);
        }

        $payments = $query->latest()->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $payments
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('create', SalaryPayment::class);

        $validator = Validator::make($request->all(), [
            'employee_id' => 'required|exists:employees,id',
            'amount' => 'required|numeric|min:0',
            'payment_date' => 'required|date',
            'month' => 'required|integer|between:1,12',
            'year' => 'required|integer',
            'payment_type' => 'required|string',
            'remarks' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        $payment = SalaryPayment::create($validator->validated());

        return response()->json([
            'success' => true,
            'message' => 'Salary payment recorded successfully',
            'data' => $payment
        ], 201);
    }

    public function show(SalaryPayment $salaryPayment)
    {
        $this->authorize('view', $salaryPayment);

        return response()->json([
            'success' => true,
            'data' => $salaryPayment->load('employee')
        ]);
    }

    public function update(Request $request, SalaryPayment $salaryPayment)
    {
        $this->authorize('update', $salaryPayment);

        $validator = Validator::make($request->all(), [
            'employee_id' => 'required|exists:employees,id',
            'amount' => 'required|numeric|min:0',
            'payment_date' => 'required|date',
            'month' => 'required|integer|between:1,12',
            'year' => 'required|integer',
            'payment_type' => 'required|string',
            'remarks' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        $salaryPayment->update($validator->validated());

        return response()->json([
            'success' => true,
            'message' => 'Salary payment updated successfully',
            'data' => $salaryPayment
        ]);
    }

    public function destroy(SalaryPayment $salaryPayment)
    {
        $this->authorize('delete', $salaryPayment);

        $salaryPayment->delete();

        return response()->json([
            'success' => true,
            'message' => 'Salary payment deleted successfully'
        ]);
    }
}
