"""
Claude API Client for LegisLight
Handles all AI-powered operations: summarization, rights detection, and translation
"""

import os
from anthropic import Anthropic
from typing import Dict, List, Optional
import json

class ClaudeClient:
    def __init__(self, api_key: Optional[str] = None):
        """Initialize Claude client with API key"""
        self.api_key = api_key or os.getenv("ANTHROPIC_API_KEY")
        if not self.api_key:
            raise ValueError("ANTHROPIC_API_KEY not found in environment variables")
        
        self.client = Anthropic(api_key=self.api_key)
        # Using Claude 3 Haiku - fast and available for this API key
        # Note: Can upgrade to claude-3-5-sonnet-20241022 with full API access
        self.model = "claude-3-haiku-20240307"
        
    def test_api_connection(self) -> Dict:
        """Test API connection and return available model info"""
        try:
            response = self.client.messages.create(
                model=self.model,
                max_tokens=100,
                messages=[{"role": "user", "content": "Hello"}]
            )
            return {
                "success": True,
                "model": self.model,
                "message": "API connection successful!"
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "api_key_prefix": self.api_key[:20] + "..." if self.api_key else "None"
            }
    
    def segment_document(self, text: str) -> Dict:
        """
        Use Claude to intelligently segment document into sections
        Returns structured JSON with sections
        """
        prompt = f"""Analyze this legal document and break it into logical sections.
For each section, identify:
1. A heading/title (if present, otherwise generate one)
2. The body text

Return ONLY a valid JSON object in this exact format:
{{
  "title": "Document title or Bill number",
  "sections": [
    {{
      "heading": "Section title",
      "body": "Section content"
    }}
  ]
}}

Document text:
{text[:8000]}
"""
        
        try:
            message = self.client.messages.create(
                model=self.model,
                max_tokens=4000,
                messages=[{"role": "user", "content": prompt}]
            )
            
            response_text = message.content[0].text
            # Extract JSON from response
            json_start = response_text.find('{')
            json_end = response_text.rfind('}') + 1
            json_str = response_text[json_start:json_end]
            
            return json.loads(json_str)
        except Exception as e:
            print(f"Error segmenting document: {e}")
            # Fallback to simple structure
            return {
                "title": "Legal Document",
                "sections": [{"heading": "Full Document", "body": text[:5000]}]
            }
    
    def simplify_text(self, text: str) -> Dict:
        """
        Simplify legal text to 8th-grade reading level
        Returns plain language summary with key points
        """
        prompt = f"""Convert this legal text into plain language at an 8th-grade reading level.

Legal text:
{text}

Provide your response in this JSON format:
{{
  "plain_summary": "Simple explanation of what this section means",
  "key_points": ["Point 1", "Point 2", "Point 3"],
  "ambiguous_terms": ["term1: explanation", "term2: explanation"],
  "readability_note": "Brief note on complexity"
}}

Keep explanations clear, concise, and accessible to non-lawyers."""

        try:
            message = self.client.messages.create(
                model=self.model,
                max_tokens=2000,
                messages=[{"role": "user", "content": prompt}]
            )
            
            response_text = message.content[0].text
            json_start = response_text.find('{')
            json_end = response_text.rfind('}') + 1
            json_str = response_text[json_start:json_end]
            
            return json.loads(json_str)
        except Exception as e:
            print(f"Error simplifying text: {e}")
            return {
                "plain_summary": "Error processing text",
                "key_points": [],
                "ambiguous_terms": [],
                "readability_note": "Processing failed"
            }
    
    def detect_rights(self, text: str) -> List[Dict]:
        """
        Detect and explain rights mentioned in legal documents
        Returns list of rights with explanations
        """
        prompt = f"""Analyze this legal document and identify any citizen/defendant rights mentioned.
Common rights include: right to counsel, right to remain silent, right to a translator, 
right to appeal, right to a speedy trial, etc.

Document:
{text}

Return ONLY a valid JSON array in this format:
[
  {{
    "right_name": "Right to Counsel",
    "plain_explanation": "You have the right to have a lawyer represent you in court. If you cannot afford one, the court may provide one for you.",
    "location_in_doc": "Section 2, Paragraph 1",
    "disclaimer": "This is general information, not legal advice. Consult with a qualified attorney for legal advice specific to your situation."
  }}
]

If no rights are explicitly mentioned, return an empty array: []"""

        try:
            message = self.client.messages.create(
                model=self.model,
                max_tokens=3000,
                messages=[{"role": "user", "content": prompt}]
            )
            
            response_text = message.content[0].text
            # Extract JSON array
            json_start = response_text.find('[')
            json_end = response_text.rfind(']') + 1
            
            if json_start == -1 or json_end == 0:
                return []
            
            json_str = response_text[json_start:json_end]
            return json.loads(json_str)
        except Exception as e:
            print(f"Error detecting rights: {e}")
            return []
    
    def translate_text(self, text: str, target_language: str) -> str:
        """
        Translate text to target language while preserving legal meaning
        """
        prompt = f"""Translate the following text to {target_language}.
Maintain the legal meaning and tone. Be accurate and clear.

Text to translate:
{text}

Provide ONLY the translation, no explanations or additional text."""

        try:
            message = self.client.messages.create(
                model=self.model,
                max_tokens=2000,
                messages=[{"role": "user", "content": prompt}]
            )
            
            return message.content[0].text.strip()
        except Exception as e:
            print(f"Error translating text: {e}")
            return f"Translation error: {str(e)}"
    
    def batch_translate(self, text: str, languages: List[str]) -> Dict[str, str]:
        """
        Translate text to multiple languages
        Returns dict with language: translation pairs
        """
        translations = {}
        for lang in languages:
            translations[lang] = self.translate_text(text, lang)
        return translations


# Test function
if __name__ == "__main__":
    from dotenv import load_dotenv
    load_dotenv()
    
    client = ClaudeClient()
    test_text = "The defendant has the right to remain silent and the right to an attorney."
    
    print("Testing Claude Client...")
    print("\n1. Simplification:")
    result = client.simplify_text(test_text)
    print(json.dumps(result, indent=2))
    
    print("\n2. Rights Detection:")
    rights = client.detect_rights(test_text)
    print(json.dumps(rights, indent=2))
    
    print("\n3. Translation:")
    translation = client.translate_text(test_text, "Spanish")
    print(translation)

