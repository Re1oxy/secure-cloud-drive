from fastapi import APIRouter
from fastapi.responses import PlainTextResponse

router = APIRouter()

@router.get("/php-info", response_class=PlainTextResponse)
async def php_info():
    return "<?php echo 'OK'; ?>"