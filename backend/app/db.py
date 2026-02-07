"""
MongoDB connection management using Motor (async driver).
"""
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.config import settings
from typing import Optional


class Database:
    """MongoDB database connection manager."""
    
    client: Optional[AsyncIOMotorClient] = None
    database: Optional[AsyncIOMotorDatabase] = None


db = Database()


async def connect_to_mongo():
    """
    Connect to MongoDB on application startup.
    Creates indexes for better query performance.
    """
    try:
        db.client = AsyncIOMotorClient(settings.mongodb_uri)
        db.database = db.client[settings.database_name]
        
        # Test the connection
        await db.client.admin.command('ping')
        print(f"✅ Connected to MongoDB: {settings.database_name}")
        
        # Create indexes for better performance
        await db.database.lectures.create_index("created_at", name="created_at_index")
        print("✅ Database indexes created")
        
    except Exception as e:
        print(f"❌ Error connecting to MongoDB: {e}")
        raise


async def close_mongo_connection():
    """Close MongoDB connection on application shutdown."""
    if db.client:
        db.client.close()
        print("✅ MongoDB connection closed")


def get_database() -> AsyncIOMotorDatabase:
    """
    Dependency to get database instance.
    Use this in FastAPI route dependencies.
    """
    return db.database
