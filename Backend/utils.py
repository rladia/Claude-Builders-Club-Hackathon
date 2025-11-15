import textwrap

def chunk_text(text: str, max_chars: int = 3000):
    """
    Break text into chunks that are <= max_chars, trying to split at sentence boundaries.
    """
    paragraphs = text.split("\n")
    chunks = []
    current = ""
    for p in paragraphs:
        if len(current) + len(p) + 1 <= max_chars:
            current += p + "\n"
        else:
            chunks.append(current.strip())
            current = p + "\n"
    if current:
        chunks.append(current.strip())
    return chunks

def save_to_file(text: str, path: str):
    with open(path, "w", encoding="utf-8") as f:
        f.write(text)
