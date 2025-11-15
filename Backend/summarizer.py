import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def summarize_transcript(transcript: str) -> str:
    """
    Summarize the transcript using OpenAI LLM.
    Returns a summary string.
    """
    messages = [
        {"role": "system", "content": "You are an AI assistant that summarizes courtroom proceedings."},
        {"role": "user", "content": f"Here is the transcript of a courtroom session:\n\n{transcript}\n\nPlease provide a summary including key events: who spoke, objections, rulings, and main arguments."}
    ]
    response = client.chat.completions.create(
        model="gpt-4",  # or gpt-3.5-turbo
        messages=messages,
        temperature=0,
        max_tokens=1000
    )
    summary = response.choices[0].message.content
    return summary

def extract_key_points(transcript: str) -> str:
    """
    Optionally: extract a structured list (bullet) of key points:
    - Speakers
    - Objections
    - Rulings
    - Decisions
    """
    messages = [
        {"role": "system", "content": "You are an AI assistant that extracts structured information from courtroom transcripts."},
        {"role": "user", "content": f"Analyze this transcript:\n\n{transcript}\n\nList key events in bullets (speaker, what they said, objections, rulings)."}
    ]
    response = client.chat.completions.create(
        model="gpt-4",
        messages=messages,
        temperature=0,
        max_tokens=1000
    )
    points = response.choices[0].message.content
    return points


if __name__ == "__main__":
    # for testing
    import sys
    if len(sys.argv) != 2:
        print("Usage: python summarizer.py transcript.txt")
        sys.exit(1)
    transcript = open(sys.argv[1], "r", encoding="utf-8").read()
    summary = summarize_transcript(transcript)
    points = extract_key_points(transcript)
    print("=== Summary ===\n", summary)
    print("\n=== Key Points ===\n", points)
