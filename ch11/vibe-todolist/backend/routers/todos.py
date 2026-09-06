from fastapi import APIRouter, Depends, HTTPException
from typing import List
import uuid
from datetime import datetime, timezone

from models import TodoCreate, TodoUpdate, TodoResponse
from database import get_db

router = APIRouter(prefix="/todos", tags=["todos"])

@router.get("", response_model=List[TodoResponse])
def get_todos(db = Depends(get_db)):
    response = db.table("todos").select("*").execute()
    return response.data

@router.post("", response_model=TodoResponse, status_code=201)
def create_todo(todo: TodoCreate, db = Depends(get_db)):
    new_todo = {
        "id": str(uuid.uuid4()),
        "title": todo.title,
        "description": todo.description,
        "is_completed": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    response = db.table("todos").insert(new_todo).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Error creating todo")
    return response.data[0]

@router.put("/{todo_id}", response_model=TodoResponse)
def update_todo(todo_id: str, todo_update: TodoUpdate, db = Depends(get_db)):
    update_data = {k: v for k, v in todo_update.model_dump().items() if v is not None}
    
    response = db.table("todos").update(update_data).eq("id", todo_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Todo not found")
    return response.data[0]

@router.delete("/{todo_id}", status_code=204)
def delete_todo(todo_id: str, db = Depends(get_db)):
    response = db.table("todos").delete().eq("id", todo_id).execute()
    # supabase python client doesn't throw if not found on delete, but we just return 204
    return
