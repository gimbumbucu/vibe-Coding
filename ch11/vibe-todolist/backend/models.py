from pydantic import BaseModel, ConfigDict
from typing import Optional

class TodoBase(BaseModel):
    title: str
    description: Optional[str] = None

class TodoCreate(TodoBase):
    pass

class TodoUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    is_completed: Optional[bool] = None

class TodoResponse(TodoBase):
    id: str
    is_completed: bool
    created_at: str

    model_config = ConfigDict(from_attributes=True)
