from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

class AnalyticsRequest(BaseModel):
    """Analytics request model"""
    user_id: str = Field(..., description="User ID")
    time_range: str = Field(default="30d", description="Time range: 7d, 30d, 90d, 1y")
    metrics: Optional[List[str]] = Field(default=None, description="Specific metrics to analyze")

class InsightRequest(BaseModel):
    """Insight generation request"""
    user_id: str = Field(..., description="User ID")
    inventory_data: List[Dict[str, Any]] = Field(..., description="Inventory data")
    analysis_type: str = Field(default="general", description="Type of analysis")

class InsightResponse(BaseModel):
    """Insight response model"""
    insights: List[str] = Field(..., description="Generated insights")
    recommendations: List[str] = Field(..., description="AI recommendations")
    generated_at: datetime = Field(default_factory=datetime.now)
