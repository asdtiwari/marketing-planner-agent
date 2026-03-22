from pydantic import BaseModel
from datetime import datetime

class PlanUpdate(BaseModel):
    title: str

class PlanResponse(BaseModel):
    id: int
    title: str
    content: str
    created_at: datetime
    organization_id: int

    class Config:
        from_attributes = True # Allows Pydantic to read SQLAlchemy ORM models