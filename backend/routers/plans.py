from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from database import supabase

router = APIRouter(prefix="/plans", tags=["Kế hoạch"])

# Khai báo cấu trúc dữ liệu nhận từ React
class PlanCreate(BaseModel):
    title: str
    plan_type: str
    plan_date: str
    plan_time: Optional[str] = None
    description: Optional[str] = None

@router.get("")
def get_all_plans():
    try:
        # Lấy dữ liệu và sắp xếp theo ngày
        response = supabase.table("plans").select("*").order("plan_date").execute()
        return {"status": "success", "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/add")
def add_plan(plan: PlanCreate):
    try:
        data = {
            "title": plan.title,
            "plan_type": plan.plan_type,
            "plan_date": plan.plan_date,
            "plan_time": plan.plan_time,
            "description": plan.description,
            "status": "pending"
        }
        result = supabase.table("plans").insert(data).execute()
        return {"status": "success", "data": result.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))