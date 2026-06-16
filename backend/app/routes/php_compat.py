import subprocess
import os
from fastapi import APIRouter
from fastapi.responses import JSONResponse
import json

router = APIRouter()

@router.get("/php-info")
async def php_info():
    php_script = os.path.join(os.path.dirname(__file__), "../php/info.php")
    php_script = os.path.abspath(php_script)
    result = subprocess.run(["php", php_script], capture_output=True, text=True)
    return JSONResponse(json.loads(result.stdout))