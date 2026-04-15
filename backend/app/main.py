import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth_router, agent_router, document_router, plan_router
from app.core.database import engine, Base

load_dotenv()

# Create all database tables automatically on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Marketing Planner Agent API")

# Configure CORS so the React frontend can communicate with FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL")], # for testing purposes, allow all origins. In production, specify your frontend URL(s) here.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the authentication routes
app.include_router(auth_router.router)
app.include_router(agent_router.router)
app.include_router(document_router.router)
app.include_router(plan_router.router)

@app.get("/")
def health_check():
    return {"status": "ok", "message": "Backend is running."}