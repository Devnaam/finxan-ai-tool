from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class ChatMessage(BaseModel):
    """Chat message model"""
    role: str = Field(..., description="Role: user or assistant")
    content: str = Field(..., description="Message content")
    timestamp: Optional[datetime] = Field(default_factory=datetime.now)

class ChatRequest(BaseModel):
    """Chat request model"""
    message: str = Field(..., min_length=1, description="User message")
    session_id: Optional[str] = Field(None, description="Chat session ID")
    user_id: str = Field(..., description="User ID")
    context: Optional[Dict[str, Any]] = Field(default=None, description="Additional context")

class ChatResponse(BaseModel):
    """Chat response model"""
    response: str = Field(..., description="AI response")
    session_id: str = Field(..., description="Session ID")
    timestamp: datetime = Field(default_factory=datetime.now)
    tokens_used: Optional[int] = Field(None, description="Tokens consumed")

class InventoryContext(BaseModel):
    """Inventory context for AI"""
    total_items: int = 0
    total_value: float = 0.0
    low_stock_count: int = 0
    categories: List[str] = []
    top_products: List[Dict[str, Any]] = []
