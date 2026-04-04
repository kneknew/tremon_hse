from fastapi import APIRouter, HTTPException

# Import biến supabase từ file database.py
from database import supabase

router = APIRouter(
    tags=["Workshops"]
)

@router.get("/workshops")
def get_all_workshops():
    try:
        response = supabase.table("workshops").select("*").execute()
        return {"status": "success", "data": response.data}
    except Exception as e:
        print(f"❌ LỖI LẤY XƯỞNG: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))