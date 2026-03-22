from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
import traceback
from app.api.dependencies import get_current_token_payload
from app.agents.planner_crew import run_marketing_planner
from app.core.database import get_db
from app.models.plan import Plan

router = APIRouter(prefix="/api/v1/agent", tags=["AI Agent"])

class PlannerRequest(BaseModel):
    goal: str

@router.post("/plan")
async def generate_marketing_plan(
    request: PlannerRequest, 
    db: Session = Depends(get_db), # Added DB dependency
    token_payload: dict = Depends(get_current_token_payload)
):
    org_id = token_payload.get("org_id")
    
    try:
        # 1. Run the Multi-Agent Crew
        final_plan_content = run_marketing_planner(goal=request.goal, org_id=org_id)
        
        # 2. Generate a default title from the goal (e.g., "Strategy: Analyze Competitor...")
        default_title = f"Strategy: {request.goal[:30]}..." if len(request.goal) > 30 else f"Strategy: {request.goal}"
        
        # 3. ATOMIC AUTO-SAVE: Write the agent's output to MySQL securely
        new_plan = Plan(
            title=default_title,
            content=final_plan_content,
            organization_id=org_id
        )
        db.add(new_plan)
        db.commit()
        db.refresh(new_plan)
        
        return {
            "status": "success",
            "plan_id": new_plan.id, # Return the DB ID so the frontend can reference it
            "goal": request.goal,
            "plan": final_plan_content
        }
    except Exception as e:
        db.rollback()
        traceback.print_exc()
        # Customizing the error so the frontend understands the exact failure
        raise HTTPException(status_code=500, detail="The AI Agent encountered an error during execution. Please try again.")