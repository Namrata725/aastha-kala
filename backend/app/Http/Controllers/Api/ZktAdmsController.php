<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\AttendanceLog;
use Carbon\Carbon;

class ZktAdmsController extends Controller
{
    /**
     * Handshake and Registry (GET /iclock/cdata)
     * The device calls this to check if it can talk to the server.
     */
    public function handshake(Request $request)
    {
        $sn = $request->query('SN');
        Log::info('ZKT ADMS Handshake from SN: ' . $sn);
        
        // Return configuration parameters the device expects
        return "GET OPTION FROM: $sn\r\n" .
               "Stamp=9999\r\n" .
               "OpStamp=9999\r\n" .
               "PhotoStamp=9999\r\n" .
               "RegistryCode=None\r\n" .
               "ServerVersion=3.1.1\r\n" .
               "ServerName=ADMS\r\n" .
               "PushVersion=3.0.1\r\n" .
               "ErrorDelay=60\r\n" .
               "Delay=30\r\n" .
               "TransTimes=00:00;14:00\r\n" .
               "TransInterval=1\r\n" .
               "TransFlag=1111111111\r\n" .
               "TimeZone=5.75\r\n" .
               "Realtime=1\r\n" .
               "Encrypt=0";
    }

    /**
     * Receive Data (POST /iclock/cdata)
     * This is where the logs are sent.
     */
    public function receiveData(Request $request)
    {
        $sn = $request->query('SN');
        $table = strtoupper($request->query('table'));
        $content = $request->getContent();

        Log::info("ADMS Data Received from $sn (Table: $table)");
        Log::debug("ADMS Raw Content: " . substr($content, 0, 500));

        if ($table === 'ATTLOG') {
            $this->parseAttendanceLogs($content);
        }

        // Must return OK for device to clear its buffer
        return "OK";
    }

    /**
     * Heartbeat (GET /iclock/getrequest)
     * Device asks for pending commands.
     */
    public function getRequest(Request $request)
    {
        return "OK";
    }

    /**
     * Parse the raw ZKT data stream
     */
    private function parseAttendanceLogs($data)
    {
        // Support both Windows (\r\n) and Linux (\n) line endings
        $lines = preg_split('/\r\n|\r|\n/', $data);
        $processedCount = 0;

        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line)) continue;

            // Log format can be Tab or Space separated: USERID TIMESTAMP_DATE TIMESTAMP_TIME STATE ...
            $parts = preg_split('/\s+/', $line);
            
            // We need at least UserID, Date, and Time
            if (count($parts) >= 3) {
                $deviceUserId = $parts[0];
                $timestamp = $parts[1] . ' ' . $parts[2];

                try {
                    $employee = \App\Models\Employee::where('device_user_id', $deviceUserId)->first();

                    AttendanceLog::updateOrCreate([
                        'device_user_id' => $deviceUserId,
                        'timestamp' => $timestamp,
                    ], [
                        'employee_id' => $employee ? $employee->id : null,
                        'status' => $parts[3] ?? '0',
                    ]);
                    $processedCount++;
                } catch (\Exception $e) {
                    Log::error("Failed to parse ADMS log line: " . $line . " Error: " . $e->getMessage());
                }
            }
        }
        
        Log::info("ADMS Processed $processedCount logs.");
    }
}
