from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found in environment variables")

genai.configure(api_key=GEMINI_API_KEY)

# Initialize FastAPI
app = FastAPI(title="Finxan AI Service", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Gemini model
model = genai.GenerativeModel('gemini-2.0-flash-exp')

# Request models
class Message(BaseModel):
    role: str
    content: str

class InventoryContext(BaseModel):
    summary: str
    total_items: Optional[int] = 0
    total_value: Optional[float] = 0.0
    low_stock_count: Optional[int] = 0
    categories: Optional[List[str]] = []
    has_data: bool = False

class ChatRequest(BaseModel):
    message: str
    inventory_context: Optional[InventoryContext] = None
    conversation_history: Optional[List[Message]] = []

class ChatResponse(BaseModel):
    response: str
    has_data: bool

# Root endpoint
@app.get("/")
async def root():
    return {
        "service": "Finxan AI Service",
        "status": "running",
        "version": "1.0.0"
    }

# Health check
@app.get("/health")
async def health():
    return {"status": "healthy"}

# Chat endpoint
@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        # Build system prompt
        system_prompt = """You are a helpful AI assistant for Finxan AI, an intelligent inventory management system.

Your role:
- Help users understand their inventory data
- Provide insights and recommendations
- Answer questions about stock levels, values, and trends
- Suggest actions for low stock items
- Be concise, friendly, and professional

Important:
- Always format numbers with proper currency and units
- Use bullet points for lists
- Highlight important information
- If asked about specific products, refer to the inventory data provided
"""

        # Add inventory context if available
        if request.inventory_context and request.inventory_context.has_data:
            system_prompt += f"\n\nCurrent Inventory Data:\n{request.inventory_context.summary}"
        else:
            system_prompt += "\n\nNote: No inventory data is currently available. The user needs to upload a file or activate a Google Sheet to see their inventory."

        # Build conversation history
        messages = []
        
        # Add system message
        messages.append({
            "role": "user",
            "parts": [system_prompt]
        })
        
        messages.append({
            "role": "model",
            "parts": ["I understand. I'm ready to help with inventory management queries."]
        })

        # Add conversation history
        if request.conversation_history:
            for msg in request.conversation_history[-5:]:  # Last 5 messages
                role = "user" if msg.role == "user" else "model"
                messages.append({
                    "role": role,
                    "parts": [msg.content]
                })

        # Add current message
        messages.append({
            "role": "user",
            "parts": [request.message]
        })

        # Generate response
        chat = model.start_chat(history=messages[:-1])
        response = chat.send_message(request.message)
        
        return ChatResponse(
            response=response.text,
            has_data=request.inventory_context.has_data if request.inventory_context else False
        )

    except Exception as e:
        print(f"Error in chat endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Run with: uvicorn app:app --reload --port 8000
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
