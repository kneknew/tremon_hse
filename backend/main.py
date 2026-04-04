from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import các router
from routers import chemicals, workshops

# Khởi tạo App
app = FastAPI(title="TREMON - HSE API")

# Cấu hình CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://musical-memory-94xwjp76j573xq4g-5173.app.github.dev" 
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Gắn các router vào app chính
app.include_router(chemicals.router)
app.include_router(workshops.router)

if __name__ == "__main__":
    import uvicorn
    # If running on Codespaces, use host="0.0.0.0"
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)