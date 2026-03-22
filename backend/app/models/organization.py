from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, index=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # The relationships linking back to the child tables
    users = relationship("User", back_populates="organization")
    
    # NEW: This is the missing line SQLAlchemy was looking for!
    plans = relationship("Plan", back_populates="organization")