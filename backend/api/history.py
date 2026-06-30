"""
History API – list past analyses.
"""
from fastapi import APIRouter
from services.database_service import list_analyses

router = APIRouter()


@router.get("/", summary="List past analyses")
async def list_history(limit: int = 20):
    items = await list_analyses(limit=limit)
    return {"items": [i.model_dump(mode="json") for i in items], "total": len(items)}
