from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional
import json
import re
import uuid

from database import supabase

router = APIRouter(
    tags=["Chemicals"]
)

@router.post("/add-chemical")
async def add_chemical(
    name: str = Form(...),
    cas_number: str = Form(...),
    workshop_id: str = Form(...),
    published_date: Optional[str] = Form(None), 
    newest_published_date: str = Form(...),
    hazard_logo_json: str = Form(...),
    location_names_json: str = Form(...), 
    other_name: Optional[str] = Form(None),
    x: Optional[float] = Form(None), 
    y: Optional[float] = Form(None), 
    msds_file: UploadFile = File(...),
    # THAY ĐỔI: Chuyển csds_file thành Optional và mặc định là None
    csds_file: Optional[UploadFile] = File(None) 
):
    try:
        unique_id = uuid.uuid4().hex[:8]
        safe_msds_name = re.sub(r'[^a-zA-Z0-9_.-]', '_', msds_file.filename)
        
        hazard_logos = json.loads(hazard_logo_json) if hazard_logo_json else []
        location_names = json.loads(location_names_json) if location_names_json else []

        # Xử lý MSDS (Bắt buộc)
        msds_content = await msds_file.read()
        msds_path = f"msds/{unique_id}_{safe_msds_name}"
        supabase.storage.from_("chemical-docs").upload(
            msds_path, 
            msds_content,
            file_options={"upsert": "true", "content-type": "application/pdf"}
        )
        
        # THAY ĐỔI: Xử lý CSDS (Chỉ thực hiện nếu có file)
        csds_path = None
        if csds_file:
            safe_csds_name = re.sub(r'[^a-zA-Z0-9_.-]', '_', csds_file.filename)
            csds_content = await csds_file.read()
            csds_path = f"csds/{unique_id}_{safe_csds_name}"
            supabase.storage.from_("chemical-docs").upload(
                csds_path, 
                csds_content,
                file_options={"upsert": "true", "content-type": "application/pdf"}
            )

        data = {
            "workshop_id": workshop_id,
            "name": name,
            "other_name": other_name,
            "cas_number": cas_number,
            "msds_path": msds_path,
            "csds_path": csds_path, # Sẽ mang giá trị null nếu không upload
            "hazard_logo": hazard_logos,
            "published_date": published_date,
            "newest_published_date": newest_published_date,
            "location_name": location_names,
            "x": x,
            "y": y
        }

        result = supabase.table("chemicals").insert(data).execute()
        return {"message": "Chemical added successfully!", "data": result.data}
    except Exception as e:
        print(f"Lỗi: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/chemicals")
def get_all_chemicals():
    response = supabase.table("chemicals").select("*, workshops(name)").execute()
    return {"status": "success", "data": response.data}

@router.put("/update-chemical/{chemical_id}")
async def update_chemical(
    chemical_id: str,
    name: str = Form(...),
    cas_number: str = Form(...),
    workshop_id: str = Form(...),
    published_date: Optional[str] = Form(None), 
    newest_published_date: str = Form(...),
    hazard_logo_json: str = Form(...),
    location_names_json: str = Form(...), 
    other_name: Optional[str] = Form(None),
    x: Optional[float] = Form(None), 
    y: Optional[float] = Form(None), 
    msds_file: Optional[UploadFile] = File(None),
    csds_file: Optional[UploadFile] = File(None)
):
    try:
        hazard_logos = json.loads(hazard_logo_json) if hazard_logo_json else []
        location_names = json.loads(location_names_json) if location_names_json else []

        data = {
            "workshop_id": workshop_id,
            "name": name,
            "other_name": other_name,
            "cas_number": cas_number,
            "hazard_logo": hazard_logos,
            "published_date": published_date,
            "newest_published_date": newest_published_date,
            "location_name": location_names,
        }
        
        if x is not None: data["x"] = x
        if y is not None: data["y"] = y

        unique_id = uuid.uuid4().hex[:8]

        if msds_file:
            safe_msds_name = re.sub(r'[^a-zA-Z0-9_.-]', '_', msds_file.filename)
            msds_content = await msds_file.read()
            msds_path = f"msds/{unique_id}_{safe_msds_name}"
            supabase.storage.from_("chemical-docs").upload(
                msds_path, 
                msds_content,
                file_options={"upsert": "true", "content-type": "application/pdf"}
            )
            data["msds_path"] = msds_path

        if csds_file:
            safe_csds_name = re.sub(r'[^a-zA-Z0-9_.-]', '_', csds_file.filename)
            csds_content = await csds_file.read()
            csds_path = f"csds/{unique_id}_{safe_csds_name}"
            supabase.storage.from_("chemical-docs").upload(
                csds_path, 
                csds_content,
                file_options={"upsert": "true", "content-type": "application/pdf"}
            )
            data["csds_path"] = csds_path

        result = supabase.table("chemicals").update(data).eq("id", chemical_id).execute()
        return {"message": "Chemical updated successfully!", "data": result.data}
    except Exception as e:
        print(f"Lỗi: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/delete-chemical/{chemical_id}")
def delete_chemical(chemical_id: str):
    try:
        result = supabase.table("chemicals").delete().eq("id", chemical_id).execute()
        return {"message": "Chemical deleted successfully!", "data": result.data}
    except Exception as e:
        print(f"Lỗi khi xóa: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))