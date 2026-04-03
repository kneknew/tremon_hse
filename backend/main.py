from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI(title="TREMON - HSE API")
app.add_middleware(
    CORSMiddleware,
    # Điền chính xác đường dẫn Frontend (cổng 5173) của bạn vào đây:
    allow_origins=[
        "http://localhost:5173",
        "https://musical-memory-94xwjp76j573xq4g-5173.app.github.dev" 
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to TREMON - HSE API"}

if __name__ == "__main__":
    import uvicorn
    # If running on Codespaces, use host="0.0.0.0"
    uvicorn.run(app, host="0.0.0.0", port=8000)