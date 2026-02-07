"""
NLP processing for summarization and key point extraction.
Uses Hugging Face Transformers for text summarization and analysis.
"""
from transformers import pipeline, AutoTokenizer, AutoModelForSeq2SeqLM
from typing import List, Optional
from app.schemas import QuizQuestion
from app.config import settings
import re
import json

# Try to import OpenAI (conditional)
try:
    from openai import OpenAI
    openai_client = OpenAI(api_key=settings.openai_api_key) if settings.openai_api_key else None
except ImportError:
    openai_client = None


# Global model instances (lazy loaded)
_summarizer = None
_summarizer_tokenizer = None
_summarizer_model = None


def load_summarization_model():
    """
    Load summarization model (singleton pattern).
    Uses BART model fine-tuned on CNN/DailyMail dataset.
    """
    global _summarizer, _summarizer_tokenizer, _summarizer_model
    
    if _summarizer is None:
        print("🔄 Loading summarization model (BART-large-CNN)...")
        
        # Load tokenizer and model separately for more control
        model_name = "facebook/bart-large-cnn"
        _summarizer_tokenizer = AutoTokenizer.from_pretrained(model_name)
        _summarizer_model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
        
        # Create pipeline
        _summarizer = pipeline(
            "summarization",
            model=_summarizer_model,
            tokenizer=_summarizer_tokenizer,
            device=-1  # Use CPU (-1), set to 0 for GPU
        )
        
        print("✅ Summarization model loaded (BART-large-CNN)")
    
    return _summarizer


def summarize_text(transcript: str, target_length: int = 200) -> str:
    """
    Generate a summary of the input transcript.
    
    Uses OpenAI GPT-4o-mini if available, otherwise falls back to BART-large-CNN.
    """
    try:
        # Handle empty or very short texts
        word_count = len(transcript.split())
        if word_count < 50:
            return transcript
        
        # --- OpenAI Path ---
        if openai_client:
            print(f"🚀 Generating summary with OpenAI (target: {target_length} words)...")
            response = openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": f"You are an expert academic assistant. Summarize the following lecture transcript in about {target_length} words. Focus on key concepts and maintain a professional tone."},
                    {"role": "user", "content": transcript}
                ],
                temperature=0.5
            )
            return response.choices[0].message.content.strip()

        # --- Local BART Path ---
        # Load model
        summarizer = load_summarization_model()
        
        print(f"📝 Generating summary with BART (target: {target_length} words)...")
        
        # Calculate token lengths
        max_input_length = 1024
        estimated_tokens = int(word_count * 1.3)
        
        # Truncate if needed
        if estimated_tokens > max_input_length:
            words = transcript.split()
            max_words = int(max_input_length / 1.3)
            transcript = " ".join(words[:max_words])
        
        min_summary_length = max(30, int(target_length * 0.75 * 1.3))
        max_summary_length = min(300, int(target_length * 1.25 * 1.3))
        
        summary_result = summarizer(
            transcript,
            max_length=max_summary_length,
            min_length=min_summary_length,
            do_sample=False,
            truncation=True,
            num_beams=4
        )
        
        return summary_result[0]['summary_text'].strip()
        
    except Exception as e:
        print(f"❌ Summarization error: {e}")
        # Fallback: return first N sentences
        sentences = re.split(r'[.!?]+', transcript)
        return '. '.join([s.strip() for s in sentences if s.strip()][:5]) + "."


def extract_key_points(text: str, num_points: int = 7) -> List[str]:
    """
    Extract key points from text.
    
    Uses OpenAI GPT-4o-mini if available, otherwise falls back to rule-based ranking.
    """
    try:
        # --- OpenAI Path ---
        if openai_client:
            print(f"🚀 Extracting {num_points} key points with OpenAI...")
            response = openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": f"Extract exactly {num_points} key points from the following lecture text. Return as a bulleted list of concise sentences."},
                    {"role": "user", "content": text}
                ],
                temperature=0.3
            )
            content = response.choices[0].message.content.strip()
            # Parse bullet points
            points = [re.sub(r'^[\s\-*•\d.]+', '', line).strip() for line in content.split('\n') if line.strip()]
            return points[:num_points]

        # --- Local Rule-Based Path ---
        print(f"🔑 Extracting {num_points} key points (local)...")
        sentences = [s.strip() for s in re.split(r'[.!?]+', text) if len(s.strip()) > 20]
        
        if not sentences:
            return ["No key points could be extracted."]
        
        if len(sentences) <= num_points:
            return [s + "." if not s.endswith(('.', '!', '?')) else s for s in sentences]
        
        # Scoring logic (simplified version of original for brevity)
        important_keywords = {'important', 'key', 'theory', 'principle', 'therefore', 'result'}
        scored = []
        for idx, sentence in enumerate(sentences):
            score = 10 if 10 <= len(sentence.split()) <= 25 else 5
            score += sum(8 for k in important_keywords if k in sentence.lower())
            score += max(0, 10 - (idx // 3))
            scored.append((score, sentence, idx))
            
        scored.sort(reverse=True, key=lambda x: x[0])
        top = sorted(scored[:num_points], key=lambda x: x[2])
        return [s.strip() + "." if not s.strip().endswith(('.', '!', '?')) else s.strip() for _, s, _ in top]
        
    except Exception as e:
        print(f"❌ Key point error: {e}")
        sentences = re.split(r'[.!?]+', text)
        return [s.strip() + "." for s in sentences if s.strip()][:num_points]


def generate_quiz(text: str, num_questions: int = 5) -> List[QuizQuestion]:
    """
    Generate quiz questions from text.
    
    Uses OpenAI GPT-4o-mini if available, otherwise falls back to rule-based logic.
    """
    print(f"📋 Generating {num_questions} quiz questions...")
    
    try:
        # --- OpenAI Path ---
        if openai_client:
            print(f"🚀 Generating quiz with OpenAI...")
            response = openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "Generate a quiz in JSON format based on the following lecture. Return a list of objects, each with 'question', 'options' (list of 4), and 'correct_answer' (must be exactly one of the options)."},
                    {"role": "user", "content": text}
                ],
                response_format={"type": "json_object"}
            )
            raw_data = json.loads(response.choices[0].message.content)
            # The JSON might be {"quiz": [...]} or just a list
            questions_data = raw_data.get("quiz", raw_data if isinstance(raw_data, list) else [])
            return [QuizQuestion(**q) for q in questions_data[:num_questions]]

        # --- Local Rule-Based Path ---
        # Improved version: Extract entities/nouns for better distractors
        candidate_sentences = extract_key_points(text, num_questions * 3)
        quiz_questions = []
        used_answers = set()
        
        # Collect a pool of potential "distractor" words from the text
        # Simple heuristic: words longer than 5 chars that aren't common stopwords
        common_words = {'the', 'a', 'an', 'is', 'are', 'was', 'were', 'and', 'but', 
                       'in', 'on', 'at', 'to', 'for', 'of', 'with', 'that', 'this', 
                       'these', 'those', 'from', 'by', 'as', 'lecture', 'concept'}
        
        all_potential_distractors = []
        for sentence in candidate_sentences:
            words = [w.strip('.,!?;:()[]"\'') for w in sentence.split()]
            valid_words = [w for w in words if len(w) > 5 and w.lower() not in common_words]
            all_potential_distractors.extend(valid_words)
            
        import random
        
        for sentence in candidate_sentences:
            if len(quiz_questions) >= num_questions: break
            
            words = sentence.split()
            if len(words) < 8: continue
            
            # Find a suitable target word to blank out
            candidates = [(i, w.strip('.,!?;:()[]"\'')) for i, w in enumerate(words) 
                          if len(w.strip('.,!?;:()[]"\'')) > 5 and w.strip('.,!?;:()[]"\'').lower() not in common_words]
            
            if not candidates: continue
            
            # Pick a random candidate word
            blank_idx, answer = random.choice(candidates)
            
            if answer.lower() in used_answers: continue
            used_answers.add(answer.lower())
            
            # Create question
            q_words = words.copy()
            q_words[blank_idx] = "__________"
            question_text = f"Complete the statement: \"{' '.join(q_words)}\""
            
            # Generate options
            options = [answer]
            
            # Pick 3 distractors from our pool
            current_distractors = [d for d in all_potential_distractors if d.lower() != answer.lower()]
            
            # If we don't have enough distractors, fall back to generic ones
            while len(options) < 4:
                if current_distractors:
                    distractor = random.choice(current_distractors)
                    if distractor not in options:
                        options.append(distractor)
                else:
                    options.append(f"Not {answer}")
                    options.append("None of the above")
                    break
            
            # Shuffle options
            random.shuffle(options)
            
            quiz_questions.append(QuizQuestion(
                question=question_text,
                options=options,
                correct_answer=answer
            ))
            
        return quiz_questions
        
    except Exception as e:
        print(f"❌ Quiz error: {e}")
        return [QuizQuestion(question="What is a key concept here?", options=["A", "B", "C", "D"], correct_answer="A")]


def get_model_info() -> dict:
    """Get information about loaded AI models."""
    return {
        "local_summarizer_loaded": _summarizer is not None,
        "openai_available": openai_client is not None,
        "openai_model": "gpt-4o-mini" if openai_client else None,
        "local_model": "facebook/bart-large-cnn"
    }
