# LegisLight: AI for Better Governance
LegisLight is an AI-driven tool designed to improve transparency, accessibility, and understanding of legislative and legal documents.

---

## Objective:
Demonstrate an end-to-end data flow for an AI assistant that can:
1. Ingest complex legislative or court documents
2. Summarize them into accessible plain language
3. Provide rights-related explanations to defendants or the public
4. Translate outputs into multiple languages
5. Do this securely, transparently, and without giving legal advice

## Installation/Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/rladia/Claude-Builders-Club-Hackathon.git
   cd Claude-Builders-Club-Hackathon
   ```

2. Install Python dependencies:
   ```bash
   cd Backend
   pip install -r requirements.txt
   ```

3. Create a `.env` file in the Backend directory:
   ```bash
   ANTHROPIC_API_KEY=your_claude_api_key_here
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. Start the backend server:
   ```bash
   python main.py
   # Server runs on http://localhost:8000
   ```

### Frontend Setup
1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   # Frontend runs on http://localhost:3002
   ```

## Usage Guide

### Uploading Documents
1. **Open the application** at http://localhost:3002
2. **Close the menu** by clicking "Get Started"
3. **Upload a document**:
   - Supported formats: PDF, DOCX, TXT
   - Audio formats: MP3, WAV, M4A, OGG, FLAC, WEBM
4. **Click "Analyze Document"** to process

### Features
- **📄 Document Analysis**: Upload legal documents for AI-powered simplification
- **🎵 Audio Transcription**: Upload court recordings for automatic transcription and analysis
- **⚖️ Rights Detection**: Automatically identifies and explains legal rights in plain language
- **📝 Simplified Sections**: View document sections in easy-to-understand language
- **🌐 Translation**: Translate summaries to Spanish, French, Mandarin, or Arabic
- **📊 Source Comparison**: Toggle between simplified and original text

### Testing
Sample files are provided in `test_docs/`:
- `sample_court_notice.txt` - Court arraignment notice
- `sample_bill.txt` - Legislative bill
- `sample_audio.wav` - Court recording audio

## Tech Stack

### Frontend
- **React** (Vite) - Modern UI framework
- **Axios** - HTTP client for API requests
- **Custom CSS** - Styled components matching design system

### Backend
- **FastAPI** - High-performance Python web framework
- **Python 3.8+** - Core language
- **uvicorn** - ASGI server

### Document Processing
- **PyPDF2** - PDF text extraction
- **python-docx** - DOCX file parsing
- **ffmpeg-python** - Audio format conversion

### AI/ML APIs
- **Claude API (Anthropic)** - Document simplification, rights detection, translation
  - Model: `claude-3-haiku-20240307`
- **OpenAI Whisper API** - Audio-to-text transcription
  - Model: `whisper-1`
- **OpenAI GPT-4** - Transcript summarization

### Utilities
- **python-dotenv** - Environment variable management
- **JSON logging** - Audit trail and transparency

## Claude API Integration
A. Simplification & Summaries
- Section-by-section rewriting
- Plain-language summaries
- Readability enforcement ("target 8th grade reading level")

B. Rights Interpretation
- Identifying rights
- Generating neutral/non-advisory explanations
- Detecting ambiguous or unclear legal language

C. Translation
- Back-translation to verify accuracy
- Multi-language support

## Challenges and Solutions
1. Parsing Inconsistent Legal Documents

*Challenge*: Bills and court notices vary massively in formatting.

*Solution*:
- Implement heuristics + regex for headings
- Fall back to LLM-based structure detection when needed

## Future Plans
With more time and resources, the next steps are:

1. Automated Legal Citations and Definitions
- Extract linked statutes
- Provide plain-language definitions for referenced terms
2. Additional Accessibility Features
- Audio read-aloud mode
- Dyslexia-friendly formatting
3. Searchable Repository of Summaries
- Public database of simplified bills
- Keyword and concept search

## Team Members and Contributions
Remi Ladia: Project idea, backend development

Izabela Litwinowicz: User experience designer (UX/UI Interface)

Jingyu Shi: Backend development
