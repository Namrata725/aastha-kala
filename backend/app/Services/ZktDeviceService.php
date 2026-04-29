<?php

namespace App\Services;

use Rats\Zkteco\Lib\ZKTeco;
use Illuminate\Support\Facades\Log;

class ZktDeviceService
{
    /**
     * Set or update a user in the ZKTeco device.
     *
     * @param int $internalId Database ID of the employee
     * @param string $deviceUserId Device ID of the employee
     * @param string $name Name of the employee
     * @return bool True if successful, false otherwise
     */
    public function setUserInDevice($internalId, $deviceUserId, $name)
    {
        if (empty($deviceUserId)) {
            return false;
        }

        try {
            $zkIp = env('ZKT_DEVICE_IP');
            $zkPort = env('ZKT_DEVICE_PORT', 4370);

            if (!$zkIp) {
                return false;
            }

            $zk = new ZKTeco($zkIp, $zkPort);
            
            if ($zk->connect()) {
                // Ensure name doesn't exceed typical ZKT limits (usually 24 chars)
                $zkName = substr($name, 0, 24);
                
                // uid (internal id), userid (device_user_id), name, password, role
                $zk->setUser($internalId, $deviceUserId, $zkName, '', 0);
                $zk->disconnect();
                
                return true;
            }
            
            Log::warning("ZKTeco: Could not connect to device at {$zkIp}:{$zkPort}");
            return false;

        } catch (\Exception $e) {
            Log::error('ZKTeco Device Error: ' . $e->getMessage());
            return false;
        }
    }

    public function removeUserFromDevice($internalId)
    {
        try {
            $zkIp = env('ZKT_DEVICE_IP');
            $zkPort = env('ZKT_DEVICE_PORT', 4370);

            if (!$zkIp) {
                return false;
            }

            $zk = new ZKTeco($zkIp, $zkPort);
            
            if ($zk->connect()) {
                $zk->removeUser($internalId);
                $zk->disconnect();
                return true;
            }
            
            return false;

        } catch (\Exception $e) {
            Log::error('ZKTeco Device Deletion Error: ' . $e->getMessage());
            return false;
        }
    }

    public function getAttendanceLogs()
    {
        try {
            $zkIp = env('ZKT_DEVICE_IP');
            $zkPort = env('ZKT_DEVICE_PORT', 4370);

            if (!$zkIp) {
                return [];
            }

            $zk = new ZKTeco($zkIp, $zkPort);
            
            if ($zk->connect()) {
                // Returns array like:
                // [ [ 'uid' => 1, 'id' => '101', 'state' => 1, 'timestamp' => '2023-01-01 10:00:00', 'type' => 1 ] ]
                $logs = $zk->getAttendance(); 
                $zk->disconnect();
                return $logs;
            }
            
            return [];

        } catch (\Exception $e) {
            Log::error('ZKTeco Fetch Logs Error: ' . $e->getMessage());
            return [];
        }
    }
}
