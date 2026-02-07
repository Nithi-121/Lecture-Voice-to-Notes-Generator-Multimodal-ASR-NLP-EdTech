import os
import sys

# Add current directory to path so we can import app modules
sys.path.append(os.getcwd())

print("🚀 Starting manual model download...")

try:
    print("\n[1/2] Downloading FasterWhisper model (Base)...")
    from app.asr import load_whisper_model
    load_whisper_model()
    print("✅ FasterWhisper model ready!")
except Exception as e:
    print(f"❌ Error downloading Whisper: {e}")

try:
    print("\n[2/2] Downloading Summarization model (BART-large-CNN)...")
    print("This is the large file (~1.6GB). Please wait...")
    from app.nlp import load_summarization_model
    load_summarization_model()
    print("✅ Summarization model ready!")
except Exception as e:
    print(f"❌ Error downloading Summarizer: {e}")

print("\n🎉 All models downloaded! You can now run the server.")
