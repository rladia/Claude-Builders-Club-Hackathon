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

--

## Project Structure
legislight/
│
├── app.py
├── requirements.txt
├── README.md
├── .env
│
├── core/
│   ├── __init__.py
│   ├── document_loader.py
│   ├── parser.py
│   ├── summarizer.py
│   ├── rights_extractor.py
│   ├── translator.py
│   ├── logger.py
│   └── utils.py
│
├── outputs/
├── logs/
└── samples/
    └── sample_bill.pdf
