import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

# Load env vars
load_dotenv()

uri = os.getenv("MONGODB_URI")
print(f"Testing connection to: {uri.split('@')[-1]}") # Print only host part for security

async def test():
    try:
        client = AsyncIOMotorClient(uri)
        await client.admin.command('ping')
        print("✅ Connection Successful!")
    except Exception as e:
        print(f"❌ Connection Failed: {e}")

if __name__ == "__main__":
    asyncio.run(test())
