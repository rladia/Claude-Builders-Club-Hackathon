import os
import openai
from dotenv import load_dotenv
import ffmpeg

load_dotenv()

openai.api_key = os.getenv("OPENAI_API_KEY")

def transcribe_audio(audio_path: str) -> str:
    """
    Transcribe an audio file using OpenAI Whisper API.
    Returns the transcribed text.
    """
    # Optionally convert to a supported format / sample rate
    # Here, assume audio_path is fine. If not, you can re-encode:
    # ffmpeg.input(audio_path).output("tmp.wav", ac=1, ar="16000").run()

    with open(audio_path, "rb") as f:
        transcript = openai.Audio.transcribe(
            model="whisper-1",
            file=f,
            # you can choose response_format, e.g. "verbose_json"
            response_format="text"
        )
    text = transcript["text"] if isinstance(transcript, dict) else transcript
    return text


if __name__ == "__main__":
    import sys
    if len(sys.argv) != 2:
        print("Usage: python transcriber.py path/to/audio")
        sys.exit(1)
    path = sys.argv[1]
    result = transcribe_audio(path)
    print("Transcript:\n", result)
