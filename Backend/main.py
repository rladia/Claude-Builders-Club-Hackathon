"""
FastAPI Backend for LegisLight
Handles document processing, AI analysis, and translations
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import os
from dotenv import load_dotenv

from document_processor import DocumentProcessor
from claude_client import ClaudeClient
from logger import AuditLogger

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="LegisLight API",
    description="AI-powered legal document simplification and translation",
    version="1.0.0"
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
claude_client = ClaudeClient()
doc_processor = DocumentProcessor()
logger = AuditLogger()

# Request/Response Models
class AnalyzeRequest(BaseModel):
    detect_rights: bool = True

class TranslateRequest(BaseModel):
    text: str
    target_language: str

class SimplifyRequest(BaseModel):
    text: str

# API Endpoints

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "LegisLight API",
        "version": "1.0.0"
    }

@app.post("/api/upload")
async def upload_document(file: UploadFile = File(...)):
    """
    Upload and process a document
    Returns extracted text and metadata
    """
    try:
        # Read file
        contents = await file.read()
        
        # Process document
        result = doc_processor.process_document(contents, file.filename)
        
        # Log upload
        logger.log_document_upload(
            file.filename,
            len(contents),
            result['file_type']
        )
        logger.log_text_extraction(
            result['char_count'],
            result['word_count']
        )
        
        return {
            "success": True,
            "data": result
        }
        
    except Exception as e:
        logger.log_error("document_upload", str(e))
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/analyze")
async def analyze_document(request: AnalyzeRequest, text: str):
    """
    Analyze document with AI
    Returns segmented sections, simplified text, and detected rights
    """
    try:
        # Segment document
        segmented = claude_client.segment_document(text)
        logger.log_ai_operation("segmentation", len(text), segmented)
        
        # Simplify each section
        simplified_sections = {}
        for section in segmented['sections']:
            simplified = claude_client.simplify_text(section['body'])
            simplified_sections[section['heading']] = simplified
            logger.log_ai_operation("simplification", len(section['body']), simplified)
        
        # Detect rights if requested
        detected_rights = []
        if request.detect_rights:
            detected_rights = claude_client.detect_rights(text)
            logger.log_ai_operation("rights_detection", len(text), detected_rights)
        
        return {
            "success": True,
            "data": {
                "segmented_doc": segmented,
                "simplified_sections": simplified_sections,
                "detected_rights": detected_rights
            }
        }
        
    except Exception as e:
        logger.log_error("document_analysis", str(e))
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/translate")
async def translate_text(request: TranslateRequest):
    """
    Translate text to target language
    """
    try:
        translation = claude_client.translate_text(
            request.text,
            request.target_language
        )
        
        logger.log_translation(
            "English",
            request.target_language,
            len(request.text)
        )
        
        return {
            "success": True,
            "data": {
                "translation": translation,
                "target_language": request.target_language
            }
        }
        
    except Exception as e:
        logger.log_error("translation", str(e))
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/simplify")
async def simplify_text(request: SimplifyRequest):
    """
    Simplify text to plain language
    """
    try:
        simplified = claude_client.simplify_text(request.text)
        
        logger.log_ai_operation("simplification", len(request.text), simplified)
        
        return {
            "success": True,
            "data": simplified
        }
        
    except Exception as e:
        logger.log_error("simplification", str(e))
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/logs")
async def get_logs():
    """
    Get audit logs for current session
    """
    try:
        logs = logger.get_logs()
        return {
            "success": True,
            "data": {
                "logs": logs,
                "count": len(logs)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/test-claude")
async def test_claude():
    """
    Test Claude API connection
    """
    try:
        result = claude_client.test_api_connection()
        return {
            "success": result['success'],
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)

