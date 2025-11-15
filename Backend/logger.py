"""
Simple Audit Logger for LegisLight
Tracks all transformations for transparency and traceability
"""

import json
import os
from datetime import datetime
from typing import Dict, Any

class AuditLogger:
    """Simple JSON-based audit logger"""
    
    def __init__(self, log_dir: str = "data/logs"):
        """Initialize logger with directory"""
        self.log_dir = log_dir
        os.makedirs(log_dir, exist_ok=True)
        self.session_id = datetime.now().strftime("%Y%m%d_%H%M%S")
        self.log_file = os.path.join(log_dir, f"session_{self.session_id}.json")
        self.logs = []
    
    def log_event(self, event_type: str, data: Dict[str, Any]) -> None:
        """Log an event with timestamp"""
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "session_id": self.session_id,
            "event_type": event_type,
            "data": data
        }
        self.logs.append(log_entry)
        self._write_to_file()
    
    def log_document_upload(self, file_name: str, file_size: int, file_type: str) -> None:
        """Log document upload event"""
        self.log_event("document_upload", {
            "file_name": file_name,
            "file_size": file_size,
            "file_type": file_type
        })
    
    def log_text_extraction(self, char_count: int, word_count: int) -> None:
        """Log text extraction results"""
        self.log_event("text_extraction", {
            "char_count": char_count,
            "word_count": word_count
        })
    
    def log_ai_operation(self, operation: str, input_length: int, output_data: Any, model: str = "claude-3-haiku-20240307") -> None:
        """Log AI operation"""
        self.log_event("ai_operation", {
            "operation": operation,
            "model": model,
            "input_length": input_length,
            "output_preview": str(output_data)[:200] + "..." if len(str(output_data)) > 200 else str(output_data)
        })
    
    def log_translation(self, source_lang: str, target_lang: str, text_length: int) -> None:
        """Log translation operation"""
        self.log_event("translation", {
            "source_language": source_lang,
            "target_language": target_lang,
            "text_length": text_length
        })
    
    def log_error(self, error_type: str, error_message: str) -> None:
        """Log error event"""
        self.log_event("error", {
            "error_type": error_type,
            "error_message": error_message
        })
    
    def _write_to_file(self) -> None:
        """Write logs to JSON file"""
        try:
            with open(self.log_file, 'w') as f:
                json.dump(self.logs, f, indent=2)
        except Exception as e:
            print(f"Error writing log file: {e}")
    
    def get_logs(self) -> list:
        """Return all logs for current session"""
        return self.logs
    
    def export_logs(self) -> str:
        """Export logs as JSON string"""
        return json.dumps(self.logs, indent=2)


# Test function
if __name__ == "__main__":
    logger = AuditLogger()
    logger.log_document_upload("test.pdf", 1024000, "pdf")
    logger.log_text_extraction(5000, 800)
    logger.log_ai_operation("summarization", 5000, {"summary": "Test summary"})
    
    print("Logs created:")
    print(json.dumps(logger.get_logs(), indent=2))

