<?php
$status = [
    'server' => 'SecureCloudDrive',
    'php_version' => phpversion(),
    'status' => 'OK',
    'time' => date('Y-m-d H:i:s')
];
echo json_encode($status);
?>