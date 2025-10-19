from fastapi import APIRouter, HTTPException
from app.models.chat import ChatRequest, ChatResponse
from app.services.gemini_service import gemini_service
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/message", response_model=ChatResponse)
async def send_message(request: ChatRequest):
    """
    Send message to AI assistant
    
    Args:
        request: Chat request with message and context
        
    Returns:
        AI response
    """
    try:
        # Generate AI response
        response_text = await gemini_service.generate_response(
            message=request.message,
            context=request.context,
            chat_history=[]  # TODO: Fetch from database
        )
        
        return ChatResponse(
            response=response_text,
            session_id=request.session_id or "default_session"
        )
        
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def chat_health():
    """Health check for chat service"""
    return {"status": "healthy", "service": "chat"}
