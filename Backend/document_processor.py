"""
Document Processing Module
Handles file upload, text extraction, and initial parsing
"""

import PyPDF2
import docx
from typing import Optional, Dict
import io

class DocumentProcessor:
    """Process various document formats and extract text"""
    
    @staticmethod
    def extract_text_from_pdf(file_bytes: bytes) -> str:
        """Extract text from PDF file"""
        try:
            pdf_file = io.BytesIO(file_bytes)
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            
            text = ""
            for page in pdf_reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n\n"
            
            return text.strip()
        except Exception as e:
            raise Exception(f"Error extracting PDF text: {str(e)}")
    
    @staticmethod
    def extract_text_from_docx(file_bytes: bytes) -> str:
        """Extract text from DOCX file"""
        try:
            docx_file = io.BytesIO(file_bytes)
            doc = docx.Document(docx_file)
            
            text = ""
            for paragraph in doc.paragraphs:
                if paragraph.text.strip():
                    text += paragraph.text + "\n\n"
            
            return text.strip()
        except Exception as e:
            raise Exception(f"Error extracting DOCX text: {str(e)}")
    
    @staticmethod
    def extract_text_from_txt(file_bytes: bytes) -> str:
        """Extract text from TXT file"""
        try:
            return file_bytes.decode('utf-8').strip()
        except UnicodeDecodeError:
            # Try different encoding
            try:
                return file_bytes.decode('latin-1').strip()
            except Exception as e:
                raise Exception(f"Error decoding TXT file: {str(e)}")
    
    @staticmethod
    def process_document(file_bytes: bytes, file_name: str) -> Dict[str, str]:
        """
        Main entry point for document processing
        Detects file type and extracts text
        """
        file_extension = file_name.lower().split('.')[-1]
        
        try:
            if file_extension == 'pdf':
                text = DocumentProcessor.extract_text_from_pdf(file_bytes)
            elif file_extension in ['docx', 'doc']:
                text = DocumentProcessor.extract_text_from_docx(file_bytes)
            elif file_extension == 'txt':
                text = DocumentProcessor.extract_text_from_txt(file_bytes)
            else:
                raise ValueError(f"Unsupported file type: {file_extension}")
            
            # Basic cleaning
            text = DocumentProcessor.clean_text(text)
            
            return {
                "text": text,
                "file_name": file_name,
                "file_type": file_extension,
                "char_count": len(text),
                "word_count": len(text.split())
            }
        except Exception as e:
            raise Exception(f"Error processing document: {str(e)}")
    
    @staticmethod
    def clean_text(text: str) -> str:
        """Clean extracted text"""
        # Remove excessive whitespace
        lines = [line.strip() for line in text.split('\n')]
        # Remove empty lines but keep paragraph breaks
        cleaned_lines = []
        prev_empty = False
        for line in lines:
            if line:
                cleaned_lines.append(line)
                prev_empty = False
            elif not prev_empty:
                cleaned_lines.append('')
                prev_empty = True
        
        return '\n'.join(cleaned_lines).strip()


# Test function
if __name__ == "__main__":
    print("Document Processor Test")
    # You can test with actual files here
    test_text = """
    Section 1. Short Title
    
    This Act may be cited as the "Example Legal Act".
    
    Section 2. Definitions
    
    In this Act, the following terms have the meanings given:
    (a) "Person" means an individual or legal entity.
    (b) "Authority" means the designated regulatory body.
    """
    
    print("Cleaning text...")
    cleaned = DocumentProcessor.clean_text(test_text)
    print(cleaned)
    print(f"\nWord count: {len(cleaned.split())}")

