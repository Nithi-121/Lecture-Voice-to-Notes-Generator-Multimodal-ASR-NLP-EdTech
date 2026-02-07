"""
FastAPI main application for Lecture Voice-to-Notes Generator.
Handles audio upload, transcription, summarization, and storage.
"""
from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Depends
from fastapi.concurrency import run_in_threadpool
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Optional, List
import os
import shutil
from pathlib import Path
import time
import imageio_ffmpeg

# Configure FFmpeg path
os.environ["PATH"] += os.pathsep + os.path.dirname(imageio_ffmpeg.get_ffmpeg_exe())
print(f"🎬 FFmpeg configured: {imageio_ffmpeg.get_ffmpeg_exe()}")

from app.db import connect_to_mongo, close_mongo_connection, get_database
from app.config import settings
from app.schemas import LectureResponse, LectureListItem
from app.repositories.lecture_repository import LectureRepository
from app.asr import transcribe_audio
from app.nlp import summarize_text, extract_key_points, generate_quiz


# Initialize FastAPI app
app = FastAPI(
    title="Lecture Voice-to-Notes Generator API",
    description="AI-powered lecture transcription and note generation",
    version="1.0.0"
)

# CORS middleware for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update with specific origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Startup and shutdown events
@app.on_event("startup")
async def startup_event():
    """Initialize database connection, create upload directory, and preload AI models."""
    await connect_to_mongo()
    
    # Create upload directory if it doesn't exist
    Path(settings.upload_dir).mkdir(parents=True, exist_ok=True)
    print(f"✅ Upload directory ready: {settings.upload_dir}")
    
    # Preload AI models for faster first request
    print("🤖 Preloading AI models...")
    try:
        from app.asr import load_whisper_model
        from app.nlp import load_summarization_model
        
        # Load models in background (this will take a few seconds on first run)
        load_whisper_model()
        load_summarization_model()
        print("✅ AI models preloaded and ready")
    except Exception as e:
        print(f"⚠️  Warning: Could not preload models: {e}")
        print("   Models will be loaded on first request instead")


@app.on_event("shutdown")
async def shutdown_event():
    """Close database connection."""
    await close_mongo_connection()


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "lecture-notes-api"}


# Model info endpoint
@app.get("/api/models/info")
async def get_model_info():
    """Get information about loaded AI models."""
    from app.asr import get_model_info as get_asr_info
    from app.nlp import get_model_info as get_nlp_info
    
    return {
        "asr": get_asr_info(),
        "nlp": get_nlp_info()
    }


# ============================================================================
# LECTURE ENDPOINTS
# ============================================================================

@app.post("/api/lectures/upload", response_model=LectureResponse)
async def upload_lecture(
    file: UploadFile = File(..., description="Audio file (.mp3, .wav, .m4a, .ogg, .flac)"),
    title: Optional[str] = Form(None, description="Optional lecture title"),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Upload and process a lecture audio file.
    
    Steps:
    1. Validate and save audio file
    2. Transcribe audio using Whisper
    3. Generate summary (150-200 words)
    4. Extract key points (5-10 bullets)
    5. Generate basic quiz questions (stub)
    6. Save to MongoDB
    7. Return processed lecture data
    
    Args:
        file: Audio file upload
        title: Optional lecture title
        db: Database dependency
    
    Returns:
        LectureResponse with all processed data
    """
    # Validate file type
    allowed_extensions = {".mp3", ".wav", ".m4a", ".ogg", ".flac"}
    file_ext = os.path.splitext(file.filename)[1].lower()
    
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: {', '.join(allowed_extensions)}"
        )
    
    # Generate unique filename
    timestamp = int(time.time() * 1000)
    safe_filename = f"lecture_{timestamp}{file_ext}"
    file_path = os.path.join(settings.upload_dir, safe_filename)
    
    try:
        # Save uploaded file
        print(f"💾 Saving file: {safe_filename}")
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Check file size
        file_size = os.path.getsize(file_path)
        if file_size > settings.max_file_size:
            os.remove(file_path)
            raise HTTPException(
                status_code=400,
                detail=f"File too large. Max size: {settings.max_file_size / 1024 / 1024}MB"
            )
        
        print(f"✅ File saved: {file_size / 1024 / 1024:.2f}MB")
        
        # Step 1: Transcribe audio
        print("🎤 Starting transcription...")
        transcript = await run_in_threadpool(transcribe_audio, file_path)
        
        if not transcript or len(transcript) < 10:
            raise HTTPException(
                status_code=400,
                detail="Transcription failed or audio is too short"
            )
        
        # Step 2: Generate summary
        print("📝 Generating summary...")
        summary = await run_in_threadpool(summarize_text, transcript, target_length=200)
        
        # Step 3: Extract key points
        print("🔑 Extracting key points...")
        key_points = await run_in_threadpool(extract_key_points, transcript, num_points=7)
        
        # Step 4: Generate quiz (stub)
        print("📋 Generating quiz questions...")
        quiz = await run_in_threadpool(generate_quiz, transcript, num_questions=5)
        
        # Step 5: Save to MongoDB
        lecture_data = {
            "title": title or f"Lecture {timestamp}",
            "audio_filename": safe_filename,
            "transcript": transcript,
            "summary": summary,
            "key_points": key_points,
            "quiz": [q.dict() for q in quiz]
        }
        
        repository = LectureRepository(db)
        lecture_id = await repository.create_lecture(lecture_data)
        
        # Prepare response
        response_data = {
            "_id": lecture_id,
            **lecture_data
        }
        
        print(f"✅ Lecture processed successfully: {lecture_id}")
        
        return LectureResponse(**response_data)
        
    except HTTPException:
        raise
    except Exception as e:
        # Clean up file on error
        if os.path.exists(file_path):
            os.remove(file_path)
        
        print(f"❌ Error processing lecture: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error processing lecture: {str(e)}"
        )
    finally:
        # Optional: Clean up audio file after processing
        # Uncomment if you don't want to keep audio files
        # if os.path.exists(file_path):
        #     os.remove(file_path)
        pass


@app.get("/api/lectures/{lecture_id}", response_model=LectureResponse)
async def get_lecture(
    lecture_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Get a specific lecture by ID.
    
    Args:
        lecture_id: Lecture ID
        db: Database dependency
    
    Returns:
        Full lecture data
    """
    repository = LectureRepository(db)
    lecture = await repository.get_lecture_by_id(lecture_id)
    
    if not lecture:
        raise HTTPException(status_code=404, detail="Lecture not found")
    
    return LectureResponse(**lecture)


    return lecture_items


@app.get("/api/lectures", response_model=List[LectureListItem])
async def get_all_lectures(
    skip: int = 0,
    limit: int = 20,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Get all lectures with pagination.
    """
    repository = LectureRepository(db)
    lectures = await repository.get_all_lectures(skip=skip, limit=limit)
    
    lecture_items = []
    for lecture in lectures:
        summary_preview = lecture.get("summary", "")[:100]
        if len(lecture.get("summary", "")) > 100:
            summary_preview += "..."
        
        lecture_items.append(LectureListItem(
            _id=lecture["_id"],
            title=lecture["title"],
            created_at=lecture["created_at"],
            summary_preview=summary_preview
        ))
    
    return lecture_items


@app.get("/api/lectures/search", response_model=List[LectureListItem])
async def search_lectures(
    q: str,
    skip: int = 0,
    limit: int = 20,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Search for lectures by keyword in title or transcript.
    """
    if not q or len(q) < 2:
        return []
        
    repository = LectureRepository(db)
    lectures = await repository.search_lectures(query=q, skip=skip, limit=limit)
    
    lecture_items = []
    for lecture in lectures:
        summary_preview = lecture.get("summary", "")[:100]
        if len(lecture.get("summary", "")) > 100:
            summary_preview += "..."
        
        lecture_items.append(LectureListItem(
            _id=lecture["_id"],
            title=lecture["title"],
            created_at=lecture["created_at"],
            summary_preview=summary_preview
        ))
    
    return lecture_items


# Optional: Delete endpoint
@app.delete("/api/lectures/{lecture_id}")
async def delete_lecture(
    lecture_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Delete a lecture by ID.
    
    Args:
        lecture_id: Lecture ID
        db: Database dependency
    
    Returns:
        Success message
    """
    repository = LectureRepository(db)
    deleted = await repository.delete_lecture(lecture_id)
    
    if not deleted:
        raise HTTPException(status_code=404, detail="Lecture not found")
    
    return {"message": "Lecture deleted successfully"}


# Run with: uvicorn app.main:app --reload
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=True
    )
