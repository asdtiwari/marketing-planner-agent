from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from app.api.dependencies import get_current_token_payload
from app.services.document_service import DocumentService

router = APIRouter(prefix="/api/v1/documents", tags=["Knowledge Base"])
doc_service = DocumentService()

@router.post("/upload/pdf")
async def upload_pdf(
    file: UploadFile = File(...), 
    token_payload: dict = Depends(get_current_token_payload)
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    
    org_id = token_payload.get("org_id")
    await doc_service.process_pdf(file, org_id)
    
    return {"message": f"Successfully ingested {file.filename} for your organization."}

@router.post("/upload/url")
async def upload_url(
    url: str = Form(...), 
    token_payload: dict = Depends(get_current_token_payload)
):
    org_id = token_payload.get("org_id")
    try:
        doc_service.process_url(url, org_id)
        return {"message": f"Successfully scraped and ingested {url}."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to scrape URL: {str(e)}")