from fastapi import APIRouter
from fastapi.responses import HTMLResponse
from datetime import datetime

router = APIRouter()

@router.get("/php-info", response_class=HTMLResponse)
async def php_info():
    return """<?php
$status = [
    'server' => 'SecureCloudDrive',
    'php_version' => '8.2.0',
    'status' => 'OK',
    'time' => date('Y-m-d H:i:s')
];
echo json_encode($status);
?>"""