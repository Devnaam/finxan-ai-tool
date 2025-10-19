from fastapi import APIRouter, HTTPException
from app.models.analytics import InsightRequest, InsightResponse
from app.services.gemini_service import gemini_service
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/generate", response_model=InsightResponse)
async def generate_insights(request: InsightRequest):
    """
    Generate AI-powered insights from inventory data
    
    Args:
        request: Insight generation request
        
    Returns:
        Generated insights and recommendations
    """
    try:
        # Generate insights using Gemini
        result = await gemini_service.generate_insights(request.inventory_data)
        
        return InsightResponse(
            insights=result.get("insights", []),
            recommendations=result.get("recommendations", [])
        )
        
    except Exception as e:
        logger.error(f"Error generating insights: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def insights_health():
    """Health check for insights service"""
    return {"status": "healthy", "service": "insights"}
