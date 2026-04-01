from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware # THÊM DÒNG NÀY VÀO ĐÂY
from typing import Optional
import os
import json
import re
import uuid
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

# Set the correct project title
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

# Initialize Supabase Client
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")
supabase = create_client(url, key)

@app.post("/add-chemical")
async def add_chemical(
    name: str = Form(...),
    cas_number: str = Form(...),
    workshop_id: str = Form(...),
    published_date: str = Form(...),
    newest_published_date: str = Form(...),
    x: float = Form(...),
    y: float = Form(...),
    # Receive JSON string for hazard logos (e.g., '["flammable", "toxic"]')
    hazard_logo_json: Optional[str] = Form(None),
    other_name: Optional[str] = Form(None),
    msds_file: UploadFile = File(...),
    csds_file: UploadFile = File(...)
):
    try:
        # Move generation and sanitization INSIDE the function
        unique_id = uuid.uuid4().hex[:8]
        safe_msds_name = re.sub(r'[^a-zA-Z0-9_.-]', '_', msds_file.filename)
        safe_csds_name = re.sub(r'[^a-zA-Z0-9_.-]', '_', csds_file.filename)

        # 1. Parse JSON string to Python list
        hazard_logos = json.loads(hazard_logo_json) if hazard_logo_json else []

        # 2. Upload MSDS file to 'chemical-docs' bucket
        msds_content = await msds_file.read()
        msds_path = f"msds/{unique_id}_{safe_msds_name}"
        supabase.storage.from_("chemical-docs").upload(
            msds_path, 
            msds_content,
            file_options={"upsert": "true", "content-type": "application/pdf"}
        )
        
        # 3. Upload CSDS file to 'chemical-docs' bucket
        csds_content = await csds_file.read()
        csds_path = f"csds/{unique_id}_{safe_csds_name}"
        supabase.storage.from_("chemical-docs").upload(
            csds_path, 
            csds_content,
            file_options={"upsert": "true", "content-type": "application/pdf"}
        )

        # 4. Save information to database
        data = {
            "workshop_id": workshop_id,
            "name": name,
            "other_name": other_name,
            "cas_number": cas_number,
            "msds_path": msds_path,
            "csds_path": csds_path,
            "hazard_logo": hazard_logos,
            "published_date": published_date,
            "newest_published_date": newest_published_date,
            "x": x,
            "y": y
        }

        result = supabase.table("chemicals").insert(data).execute()
        
        # English response message
        return {"message": "Chemical added successfully!", "data": result.data}

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/chemicals")
def get_all_chemicals():
    # Cú pháp "*, workshops(name)" sẽ tự động nối bảng và lấy tên xưởng cho bạn
    response = supabase.table("chemicals").select("*, workshops(name)").execute()
    return {"status": "success", "data": response.data}


if __name__ == "__main__":
    import uvicorn
    # If running on Codespaces, use host="0.0.0.0"
    uvicorn.run(app, host="0.0.0.0", port=8000)