from fastapi import APIRouter, HTTPException
from core.database import supabase

router = APIRouter(prefix="/workshops", tags=["Xưởng"])

@router.get("/")
def get_all_workshops():
    try:
        response = supabase.table("workshops").select("*").execute()
        return {"status": "success", "data": response.data}
    except Exception as e:
        print(f"❌ LỖI LẤY XƯỞNG: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))