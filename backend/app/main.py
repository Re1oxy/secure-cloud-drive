from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base, get_db
from app.routes.auth import router as auth_router
from app.routes.files import router as files_router
from app.routes.logs import router as logs_router
from app.routes.twofa import router as twofa_router
from app.routes.admin import router as admin_router
from app.core.security import hash_password, create_access_token
from app.routes.php_compat import router as php_router
from app.models.user import User
from app.models.user import User, UserRole
import app.models

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Secure Cloud Drive",
    description="End-to-end encrypted file storage",
    version="1.0.0",
    root_path="/api"
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
app.include_router(php_router)

@app.on_event("startup")
def create_admin():
    db = next(get_db())
    try:
        existing = db.query(User).filter(
            (User.email == "admin@admin.com") | (User.username == "admin")
        ).first()
        if not existing:
            admin = User(
                email="admin@admin.com",
                username="admin",
                hashed_password=hash_password("admin123"),
                role=UserRole.admin
            )
            db.add(admin)
            db.commit()
            print("✅ Admin created: admin@admin.com / admin123")
    finally:
        db.close()

@app.get("/health")
async def health():
    return {"status": "ok", "message": "Secure Cloud Drive running"}