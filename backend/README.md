# Lecture Voice-to-Notes Generator - Backend API

FastAPI backend for AI-powered lecture transcription and note generation using Whisper ASR and NLP.

## 🚀 Features

- **Audio Transcription**: Convert lecture audio to text using **FasterWhisper** (4x faster than OpenAI Whisper)
  - Voice Activity Detection (VAD) for automatic silence removal
  - Language detection with confidence scores
  - Optimized inference with CTranslate2
- **Smart Summarization**: Generate 150-200 word summaries using **BART-large-CNN** model
  - Beam search for higher quality
  - Automatic truncation for long transcripts
  - Fallback mechanism for reliability
- **Key Points Extraction**: Automatically extract 5-10 key bullet points
  - Multi-factor scoring algorithm (length, keywords, position, data)
  - Maintains narrative flow
  - Filters for relevance
- **Quiz Generation**: Intelligent fill-in-the-blank question generation
  - Smart word selection (avoids common words)
  - Contextual question creation
  - Ready for T5/GPT enhancement
- **MongoDB Storage**: Persistent storage of lectures and processed data
- **RESTful API**: Clean FastAPI endpoints with automatic documentation
- **Model Preloading**: AI models loaded on startup for fast first request

## 🛠️ Tech Stack

- **Framework**: FastAPI 0.109.0
- **Database**: MongoDB (Motor async driver)
- **ASR**: FasterWhisper 1.0.0 (4x faster than OpenAI Whisper)
- **NLP**: Hugging Face Transformers (BART-large-CNN)
- **Validation**: Pydantic v2
- **Optimization**: CTranslate2 for efficient inference

## 📁 Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app & routes
│   ├── config.py               # Environment configuration
│   ├── db.py                   # MongoDB connection
│   ├── schemas.py              # Pydantic models
│   ├── asr.py                  # Whisper transcription
│   ├── nlp.py                  # Summarization & key points
│   └── repositories/
│       ├── __init__.py
│       └── lecture_repository.py  # MongoDB CRUD
├── requirements.txt
├── Dockerfile
├── .env.example
└── README.md
```

## 🔧 Backend Setup & Installation

Follow these steps to get the backend running locally:

### 1. Create a Virtual Environment
Isolate your dependencies by creating a virtual environment.

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### 2. Install Dependencies
Install all required Python packages, including FastAPI, FasterWhisper, and Transformers.

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

> [!NOTE]
> The first time you run the app, it will download necessary AI models (~2GB):
> - **FasterWhisper (base)**: ~140MB
> - **BART-large-CNN**: ~1.6GB

### 3. Configure Environment Variables
The application requires a MongoDB connection. Follow these steps to set it up:

1. **Create .env file**:
   ```bash
   cp .env.example .env
   ```
2. **Set MONGODB_URI**:
   Open the newly created `.env` file and replace the placeholder with your actual MongoDB Atlas connection string.
   
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxx.mongodb.net/
   DATABASE_NAME=lecture_notes
   ```

### 4. Run the Application
Start the FastAPI server using Uvicorn with auto-reload enabled.

```bash
# Run from the 'backend' root directory
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will now be accessible at: **http://localhost:8000**
Interactive API docs: [http://localhost:8000/docs](http://localhost:8000/docs)


## 📚 API Documentation

Once running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Endpoints

#### 1. Upload Lecture
```http
POST /api/lectures/upload
Content-Type: multipart/form-data

Parameters:
- file: audio file (.mp3, .wav, .m4a, .ogg, .flac)
- title: optional lecture title

Response: LectureResponse with transcript, summary, key_points
```

#### 2. Get Lecture by ID
```http
GET /api/lectures/{lecture_id}

Response: Full lecture data
```

#### 3. List All Lectures
```http
GET /api/lectures?skip=0&limit=20

Response: Array of lecture summaries
```

#### 4. Delete Lecture
```http
DELETE /api/lectures/{lecture_id}

Response: Success message
```

## 🧪 Testing

### Test with cURL

```bash
# Health check
curl http://localhost:8000/health

# Upload lecture
curl -X POST http://localhost:8000/api/lectures/upload \
  -F "file=@sample.mp3" \
  -F "title=Introduction to AI"

# Get all lectures
curl http://localhost:8000/api/lectures
```

### Test with Python

```python
import requests

# Upload
with open("lecture.mp3", "rb") as f:
    response = requests.post(
        "http://localhost:8000/api/lectures/upload",
        files={"file": f},
        data={"title": "My Lecture"}
    )
    print(response.json())
```

## 🐳 Docker Deployment

### Build Image

```bash
docker build -t lecture-notes-api .
```

### Run Container

```bash
docker run -d \
  -p 8000:8000 \
  -e MONGODB_URI="your_mongodb_uri" \
  -e DATABASE_NAME="lecture_notes" \
  --name lecture-api \
  lecture-notes-api
```

## ☁️ Cloud Deployment

### Render / Railway

1. Connect your GitHub repository
2. Set environment variables:
   - `MONGODB_URI`
   - `DATABASE_NAME`
3. Deploy with:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### MongoDB Atlas Setup

1. Create cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create database user
3. Whitelist IP addresses (0.0.0.0/0 for development)
4. Get connection string and add to `.env`

## 🔍 Troubleshooting

### Issue: "Module not found"
```bash
# Ensure you're in the backend directory and venv is activated
pip install -r requirements.txt
```

### Issue: "MongoDB connection failed"
- Check `MONGODB_URI` in `.env`
- Verify IP whitelist in MongoDB Atlas
- Test connection string

### Issue: "Transcription too slow"
- Use smaller Whisper model: change `model_size="tiny"` in `asr.py`
- Or use FasterWhisper (uncomment alternative code in `asr.py`)

### Issue: "Out of memory"
- Reduce Whisper model size
- Use CPU instead of GPU for transformers
- Process shorter audio files

## 📝 Model Configuration

### Whisper Models (in `asr.py`)

| Model  | Size  | Speed | Accuracy |
|--------|-------|-------|----------|
| tiny   | 39MB  | Fast  | Low      |
| base   | 74MB  | Good  | Medium   |
| small  | 244MB | Slow  | High     |
| medium | 769MB | Slower| Higher   |
| large  | 1.5GB | Slowest| Highest |

Default: `base` (good balance)

### Summarization (in `nlp.py`)

- Model: `facebook/bart-large-cnn`
- Target: 150-200 words
- Fallback: First 5 sentences if model fails

## 🚧 Future Enhancements

- [ ] Advanced quiz generation using T5/GPT
- [ ] Support for multiple languages
- [ ] Speaker diarization
- [ ] Real-time streaming transcription
- [ ] User authentication & authorization
- [ ] Rate limiting
- [ ] Caching layer (Redis)
- [ ] Background task queue (Celery)

## 📄 License

MIT License - feel free to use for your projects!

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.

---

**Built with ❤️ using FastAPI, Whisper, and Transformers**
