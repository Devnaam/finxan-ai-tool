import os
import google.generativeai as genai
from typing import List, Dict, Any, Optional
import logging
import json

logger = logging.getLogger(__name__)

class GeminiService:
    """Service for interacting with Google Gemini API"""
    
    def __init__(self):
        """Initialize Gemini service"""
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY not found in environment variables")
        
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-2.0-flash-exp')
        logger.info("Gemini service initialized successfully")
    
    async def generate_response(
        self, 
        message: str, 
        context: Optional[Dict[str, Any]] = None,
        chat_history: Optional[List[Dict[str, str]]] = None
    ) -> str:
        """
        Generate AI response with FULL inventory context
        """
        try:
            # Build comprehensive prompt
            system_prompt = self._build_detailed_prompt(context)
            
            # Add chat history
            full_prompt = system_prompt
            if chat_history:
                full_prompt += "\n\nPrevious conversation:\n"
                for msg in chat_history[-5:]:
                    role = msg.get('role', 'user')
                    content = msg.get('content', '')
                    full_prompt += f"{role}: {content}\n"
            
            full_prompt += f"\n\nUser: {message}\nAssistant:"
            
            # Generate response
            response = self.model.generate_content(full_prompt)
            
            return response.text
            
        except Exception as e:
            logger.error(f"Error generating response: {str(e)}")
            return "I apologize, but I'm having trouble processing your request. Please try again."
    
    def _build_detailed_prompt(self, context: Optional[Dict[str, Any]] = None) -> str:
        """Build detailed system prompt with ALL inventory data"""
        prompt = """You are an intelligent AI assistant for Finxan AI, an inventory management platform.

Your role: Answer questions about the user's inventory using the ACTUAL DATA provided below.

CRITICAL RULES:
1. ALWAYS use the actual data provided in the context - never make up numbers
2. Answer questions DIRECTLY - don't ask follow-up questions unless absolutely necessary
3. Be specific and precise with numbers
4. Format numbers with proper separators (e.g., 26,344 not 26344)
5. If asked about currency conversion, do the math yourself
6. If asked about categories, list them from the actual data
7. Provide insights and recommendations based on the data

"""
        
        if context and context.get('hasData'):
            summary = context.get('summary', {})
            category_breakdown = context.get('categoryBreakdown', {})
            stock_status = context.get('stockStatus', {})
            top_products = context.get('topProducts', [])
            low_stock_items = context.get('lowStockItems', [])
            
            prompt += f"""
CURRENT INVENTORY DATA:

📊 SUMMARY:
- Total Products: {summary.get('totalProducts', 0):,}
- Total Items: {summary.get('totalItems', 0):,}
- Total Value: ${summary.get('totalValue', 0):,.2f} USD
- Categories: {', '.join(summary.get('categories', []))}

📦 STOCK STATUS:
- In Stock: {stock_status.get('inStock', 0):,} products
- Low Stock: {stock_status.get('lowStock', 0):,} products
- Out of Stock: {stock_status.get('outOfStock', 0):,} products

💰 CATEGORY BREAKDOWN:
"""
            for cat, data in category_breakdown.items():
                prompt += f"- {cat}: {data['items']} products, {data['quantity']:,} items, ${data['value']:,.2f} value\n"
            
            if top_products:
                prompt += f"\n🔝 TOP 10 VALUABLE PRODUCTS:\n"
                for i, prod in enumerate(top_products[:10], 1):
                    prompt += f"{i}. {prod['name']}: ${prod['value']:,.2f} ({prod['quantity']} × ${prod['price']:,.2f})\n"
            
            if low_stock_items:
                prompt += f"\n⚠️  LOW STOCK ALERTS ({len(low_stock_items)} items):\n"
                for item in low_stock_items[:10]:
                    prompt += f"- {item['name']}: {item['quantity']} left ({item['status']})\n"
            
            prompt += "\nUse this data to answer the user's questions accurately and helpfully."
        else:
            prompt += "\nNOTE: User has no inventory data uploaded yet. Suggest uploading a file."
        
        return prompt

# Singleton instance
gemini_service = GeminiService()
