<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Student;
use App\Models\StudentFee;
use App\Models\Setting;

class BackfillAdmissionFees extends Command
{
    protected $signature = 'fees:backfill-admission';
    protected $description = 'Create pending admission fee records for every student that does not have one yet.';

    public function handle(): int
    {
        $setting = Setting::first();
        $admissionFee = $setting ? (float) ($setting->admission_fee ?? 0) : 0;

        // Find students without any admission/billing fee record
        $students = Student::whereDoesntHave('fees', function ($q) {
            $q->whereIn('fee_type', ['admission', 'billing']);
        })->get();

        if ($students->isEmpty()) {
            $this->info('All students already have an admission fee record. Nothing to do.');
            return self::SUCCESS;
        }

        $this->info("Creating fee records for {$students->count()} student(s) …");
        $bar = $this->output->createProgressBar($students->count());
        $bar->start();

        foreach ($students as $student) {
            StudentFee::create([
                'student_id' => $student->id,
                'fee_type' => 'admission',
                'total_amount' => $admissionFee,
                'paid_amount' => 0,
                'pending_amount' => $admissionFee,
                'status' => $admissionFee > 0 ? 'pending' : 'paid',
                'admission_fee' => $admissionFee,
                'payment_method' => 'Cash',
                'remarks' => $admissionFee > 0
                    ? 'Admission fee – backfilled'
                    : 'Admission fee – not set yet (configure in Settings → Fees)',
            ]);
            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info('Done! All students now appear in Fees & Billing.');

        return self::SUCCESS;
    }
}
