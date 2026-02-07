import wave
import math
import struct

# Audio parameters
sample_rate = 44100
duration = 5  # seconds
frequency = 440.0  # Hz

# Generate simple sine wave
n_samples = int(sample_rate * duration)
data = []
for i in range(n_samples):
    value = int(32767.0 * math.sin(2 * math.pi * frequency * i / sample_rate))
    data.append(value)

# Write to WAV file
with wave.open("test_audio.wav", "w") as wav_file:
    wav_file.setnchannels(1)  # Mono
    wav_file.setsampwidth(2)  # 2 bytes per sample (16-bit)
    wav_file.setframerate(sample_rate)
    
    # Pack data as 16-bit integers
    for value in data:
        wav_file.writeframes(struct.pack("<h", value))

print("Created test_audio.wav")
