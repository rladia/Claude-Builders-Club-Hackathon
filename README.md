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

## Installation/setup instructions

--

## Usage Guide

--

## Tech Stack

--

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

-- 

## Challenges and Solutions

1. Parsing Inconsistent Legal Documents

*Challenge*: Bills and court notices vary massively in formatting.
*Solution*:
- Implement heuristics + regex for headings
- Fall back to LLM-based structure detection when needed

--

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

--

## Team Members and Contributions
Remi Ladia: Project idea, backend development
Izabela Litwinowicz: Frontend development
Jingyu Shi: Backend development
