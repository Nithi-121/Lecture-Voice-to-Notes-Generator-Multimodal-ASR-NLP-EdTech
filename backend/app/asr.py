"""
Automatic Speech Recognition (ASR) using FasterWhisper.
Transcribes audio files to text with improved performance.
"""
from faster_whisper import WhisperModel
import os
from typing import Optional


# Global model instance (lazy loaded)
_whisper_model: Optional[WhisperModel] = None


def load_whisper_model(model_size: str = "base") -> WhisperModel:
    """
    Load FasterWhisper model (singleton pattern).
    
    FasterWhisper is 4x faster than OpenAI Whisper with same accuracy.
    Uses CTranslate2 for optimized inference.
    
    Args:
        model_size: Model size - "tiny", "base", "small", "medium", "large-v2"
                   base is a good balance between speed and accuracy
    
    Returns:
        Loaded FasterWhisper model
    """
    global _whisper_model
    
    if _whisper_model is None:
        print(f"🔄 Loading FasterWhisper model: {model_size}")
        _whisper_model = WhisperModel(
            model_size,
            device="cpu",  # Use "cuda" for GPU acceleration
            compute_type="int8",  # int8 for CPU, float16 for GPU
            download_root=None,  # Use default cache directory
            num_workers=1
        )
        print(f"✅ FasterWhisper model loaded: {model_size}")
    
    return _whisper_model


def transcribe_audio(file_path: str) -> str:
    """
    Transcribe audio file to text using FasterWhisper.
    
    Args:
        file_path: Path to the audio file
    
    Returns:
        Transcribed text (cleaned and formatted)
    
    Raises:
        FileNotFoundError: If audio file doesn't exist
        Exception: If transcription fails
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Audio file not found: {file_path}")
    
    try:
        # Load model
        model = load_whisper_model()
        
        print(f"🎤 Transcribing audio: {os.path.basename(file_path)}")
        
        # Transcribe with FasterWhisper
        # Returns generator of segments
        segments, info = model.transcribe(
            file_path,
            language="en",  # Set to None for auto-detection
            task="transcribe",
            beam_size=5,  # Higher = more accurate but slower
            vad_filter=True,  # Voice Activity Detection to remove silence
            vad_parameters=dict(
                min_silence_duration_ms=500,  # Minimum silence duration
                threshold=0.5  # Voice detection threshold
            )
        )
        
        # Detected language info
        print(f"📊 Detected language: {info.language} (probability: {info.language_probability:.2f})")
        
        # Collect all segments
        transcript_segments = []
        for segment in segments:
            transcript_segments.append(segment.text.strip())
        
        # Join all segments into full transcript
        transcript = " ".join(transcript_segments)
        
        # Clean up transcript
        transcript = clean_transcript(transcript)
        
        print(f"✅ Transcription complete: {len(transcript)} characters, {len(transcript.split())} words")
        
        return transcript
        
    except Exception as e:
        print(f"❌ Transcription error: {e}")
        raise Exception(f"Failed to transcribe audio: {str(e)}")


def clean_transcript(text: str) -> str:
    """
    Clean up transcribed text.
    
    Args:
        text: Raw transcript text
    
    Returns:
        Cleaned transcript
    """
    # Remove extra whitespace
    text = " ".join(text.split())
    
    # Capitalize first letter
    if text:
        text = text[0].upper() + text[1:]
    
    # Ensure proper ending punctuation
    if text and text[-1] not in ".!?":
        text += "."
    
    return text


def get_model_info() -> dict:
    """
    Get information about the loaded model.
    
    Returns:
        Dictionary with model information
    """
    if _whisper_model is None:
        return {"loaded": False}
    
    return {
        "loaded": True,
        "model_type": "FasterWhisper",
        "device": "cpu",  # or "cuda" if GPU
        "compute_type": "int8"
    }
