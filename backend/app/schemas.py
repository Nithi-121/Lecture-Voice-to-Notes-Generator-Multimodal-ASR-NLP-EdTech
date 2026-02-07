"""
Pydantic schemas for request/response validation.
"""
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class QuizQuestion(BaseModel):
    """Schema for a quiz question."""
    question: str
    options: List[str]
    correct_answer: str


class LectureCreate(BaseModel):
    """Schema for creating a new lecture (used with file upload)."""
    title: Optional[str] = Field(None, description="Optional title for the lecture")


class LectureResponse(BaseModel):
    """Schema for lecture response with all processed data."""
    id: str = Field(..., alias="_id", description="Lecture ID")
    title: str
    created_at: datetime
    audio_filename: str
    transcript: str
    summary: str
    key_points: List[str]
    quiz: Optional[List[QuizQuestion]] = []
    
    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "_id": "507f1f77bcf86cd799439011",
                "title": "Introduction to Machine Learning",
                "created_at": "2024-01-15T10:30:00",
                "audio_filename": "lecture_001.mp3",
                "transcript": "Today we will discuss...",
                "summary": "This lecture introduces fundamental concepts...",
                "key_points": [
                    "Machine learning is a subset of AI",
                    "Supervised learning uses labeled data"
                ],
                "quiz": []
            }
        }


class LectureListItem(BaseModel):
    """Schema for lecture list items (summary view)."""
    id: str = Field(..., alias="_id")
    title: str
    created_at: datetime
    summary_preview: str = Field(..., description="First 100 characters of summary")
    
    class Config:
        populate_by_name = True
