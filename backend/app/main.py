from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base
from app.routes.auth import router as auth_router
from app.routes.files import router as files_router
from app.routes.logs import router as logs_router
from app.routes.twofa import router as twofa_router
from app.routes.admin import router as admin_router
import app.models

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Secure Cloud Drive",
    description="End-to-end encrypted file storage",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(files_router)
app.include_router(logs_router)
app.include_router(twofa_router)
app.include_router(admin_router)


@app.get("/health")
async def health():
    return {"status": "ok", "message": "Secure Cloud Drive running"}