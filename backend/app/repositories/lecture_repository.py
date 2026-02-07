"""
Repository layer for lecture CRUD operations with MongoDB.
"""
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from typing import List, Optional, Dict
from datetime import datetime


class LectureRepository:
    """Repository for lecture data operations."""
    
    def __init__(self, database: AsyncIOMotorDatabase):
        """
        Initialize repository with database instance.
        
        Args:
            database: MongoDB database instance
        """
        self.collection = database.lectures
    
    async def create_lecture(self, lecture_data: Dict) -> str:
        """
        Create a new lecture document in MongoDB.
        
        Args:
            lecture_data: Dictionary containing lecture data
        
        Returns:
            Inserted lecture ID as string
        """
        # Add timestamp
        lecture_data["created_at"] = datetime.utcnow()
        
        # Insert into MongoDB
        result = await self.collection.insert_one(lecture_data)
        
        print(f"✅ Lecture saved to MongoDB: {result.inserted_id}")
        
        return str(result.inserted_id)
    
    async def get_lecture_by_id(self, lecture_id: str) -> Optional[Dict]:
        """
        Retrieve a lecture by its ID.
        
        Args:
            lecture_id: Lecture ID as string
        
        Returns:
            Lecture document or None if not found
        """
        try:
            # Convert string ID to ObjectId
            object_id = ObjectId(lecture_id)
            
            # Find lecture
            lecture = await self.collection.find_one({"_id": object_id})
            
            if lecture:
                # Convert ObjectId to string for JSON serialization
                lecture["_id"] = str(lecture["_id"])
                return lecture
            
            return None
            
        except Exception as e:
            print(f"❌ Error fetching lecture {lecture_id}: {e}")
            return None
    
    async def get_all_lectures(
        self, 
        skip: int = 0, 
        limit: int = 20
    ) -> List[Dict]:
        """
        Retrieve all lectures with pagination.
        
        Args:
            skip: Number of documents to skip
            limit: Maximum number of documents to return
        
        Returns:
            List of lecture documents
        """
        try:
            # Query with pagination, sorted by newest first
            cursor = self.collection.find().sort("created_at", -1).skip(skip).limit(limit)
            
            lectures = await cursor.to_list(length=limit)
            
            # Convert ObjectId to string
            for lecture in lectures:
                lecture["_id"] = str(lecture["_id"])
            
            print(f"✅ Retrieved {len(lectures)} lectures")
            
            return lectures
            
        except Exception as e:
            print(f"❌ Error fetching lectures: {e}")
            return []
    
    async def delete_lecture(self, lecture_id: str) -> bool:
        """
        Delete a lecture by ID.
        
        Args:
            lecture_id: Lecture ID as string
        
        Returns:
            True if deleted, False otherwise
        """
        try:
            object_id = ObjectId(lecture_id)
            result = await self.collection.delete_one({"_id": object_id})
            
            return result.deleted_count > 0
            
        except Exception as e:
            print(f"❌ Error deleting lecture {lecture_id}: {e}")
            return False
    
    async def get_lecture_count(self) -> int:
        """
        Get total number of lectures.
        
        Returns:
            Total count of lectures
        """
        try:
            count = await self.collection.count_documents({})
            return count
        except Exception as e:
            print(f"❌ Error counting lectures: {e}")
            return 0

    async def search_lectures(self, query: str, skip: int = 0, limit: int = 20) -> List[Dict]:
        """
        Search for lectures by title or transcript content.
        
        Args:
            query: Search string
            skip: Pagination skip
            limit: Pagination limit
            
        Returns:
            List of matching lectures
        """
        try:
            # Use a case-insensitive regex search for both title and transcript
            search_filter = {
                "$or": [
                    {"title": {"$regex": query, "$options": "i"}},
                    {"transcript": {"$regex": query, "$options": "i"}}
                ]
            }
            
            cursor = self.collection.find(search_filter).sort("created_at", -1).skip(skip).limit(limit)
            lectures = await cursor.to_list(length=limit)
            
            for lecture in lectures:
                lecture["_id"] = str(lecture["_id"])
                
            return lectures
        except Exception as e:
            print(f"❌ Error searching lectures: {e}")
            return []
