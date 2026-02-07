# 🚀 Quick Start Guide - Backend

## Prerequisites
- Python 3.11 or higher
- MongoDB Atlas account (free tier works)
- 3GB free disk space (for AI models)

## Setup (Windows)

### Option 1: Automated Setup
```bash
cd backend
setup.bat
```

### Option 2: Manual Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env
# Edit .env with your MongoDB URI
```

## Setup (macOS/Linux)

### Option 1: Automated Setup
```bash
cd backend
chmod +x setup.sh
./setup.sh
```

### Option 2: Manual Setup
```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI
```

## MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user:
   - Database Access → Add New Database User
   - Username: `lectureapp`
   - Password: (generate strong password)
4. Whitelist your IP:
   - Network Access → Add IP Address
   - Add `0.0.0.0/0` for development (allow all)
5. Get connection string:
   - Clusters → Connect → Connect your application
   - Copy connection string
   - Replace `<password>` with your actual password
6. Update `.env`:
   ```
   MONGODB_URI=mongodb+srv://lectureapp:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   DATABASE_NAME=lecture_notes
   ```

## Run the Server

```bash
# Activate virtual environment (if not already active)
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Start the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Server will start at: **http://localhost:8000**

## Test the API

### 1. Open API Documentation
Visit: **http://localhost:8000/docs**

### 2. Test with Sample Audio

**Using cURL (Windows PowerShell):**
```powershell
curl.exe -X POST "http://localhost:8000/api/lectures/upload" `
  -F "file=@sample.mp3" `
  -F "title=Test Lecture"
```

**Using cURL (macOS/Linux):**
```bash
curl -X POST "http://localhost:8000/api/lectures/upload" \
  -F "file=@sample.mp3" \
  -F "title=Test Lecture"
```

**Using Python:**
```python
import requests

with open("sample.mp3", "rb") as f:
    response = requests.post(
        "http://localhost:8000/api/lectures/upload",
        files={"file": f},
        data={"title": "My First Lecture"}
    )
    print(response.json())
```

### 3. Get All Lectures
```bash
curl http://localhost:8000/api/lectures
```

## Expected Output

On first run, you'll see:
```
🔄 Loading Whisper model: base
✅ Whisper model loaded: base
🔄 Loading summarization model (BART)...
✅ Summarization model loaded
✅ Connected to MongoDB: lecture_notes
✅ Database indexes created
✅ Upload directory ready: ./uploads
```

When processing a lecture:
```
💾 Saving file: lecture_1234567890.mp3
✅ File saved: 2.45MB
🎤 Starting transcription...
🎤 Transcribing audio: lecture_1234567890.mp3
✅ Transcription complete: 1234 characters
📝 Generating summary...
✅ Summary generated: 187 words
🔑 Extracting 7 key points...
✅ Extracted 7 key points
📋 Generating 5 quiz questions (stub)...
✅ Generated 5 quiz questions (basic)
✅ Lecture saved to MongoDB: 507f1f77bcf86cd799439011
✅ Lecture processed successfully: 507f1f77bcf86cd799439011
```

## Troubleshooting

### Error: "No module named 'app'"
```bash
# Make sure you're in the backend directory
cd backend
# Activate virtual environment
venv\Scripts\activate  # Windows
source venv/bin/activate  # macOS/Linux
```

### Error: "MongoDB connection failed"
- Check your `MONGODB_URI` in `.env`
- Verify IP whitelist in MongoDB Atlas
- Test connection string format

### Error: "Out of memory"
- Use smaller Whisper model: Edit `asr.py`, change `model_size="tiny"`
- Process shorter audio files
- Close other applications

### Slow transcription
- First run downloads models (~2GB) - this is normal
- Use `faster-whisper` instead (see `asr.py` comments)
- Use smaller model size

## Next Steps

1. ✅ Backend is running
2. 📱 Build the frontend (React app)
3. 🔗 Connect frontend to backend
4. 🚀 Deploy to production

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/api/lectures/upload` | Upload & process lecture |
| GET | `/api/lectures` | List all lectures |
| GET | `/api/lectures/{id}` | Get specific lecture |
| DELETE | `/api/lectures/{id}` | Delete lecture |

## Support

For issues or questions:
- Check the full [README.md](README.md)
- Review API docs at `/docs`
- Check MongoDB Atlas connection

---

**Happy coding! 🎉**
