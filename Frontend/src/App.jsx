import { useState } from 'react';
import axios from 'axios';
import './App.css';
import logoSvg from './assets/logo.svg';
import uploadArrowSvg from './assets/upload-arrow.svg';
import ellipsesSvg from './assets/ellipses.svg';
import questionImgSvg from './assets/question-img.svg';

const API_BASE_URL = 'http://localhost:8000';

function App() {
  const [file, setFile] = useState(null);
  const [documentData, setDocumentData] = useState(null);
  const [analyzedData, setAnalyzedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [showTranslations, setShowTranslations] = useState(false);
  const [translatedContent, setTranslatedContent] = useState({});
  const [showMenu, setShowMenu] = useState(true); // Menu open by default
  const [language, setLanguage] = useState('English');
  const [recentDocs, setRecentDocs] = useState([]);
  const [isAudioFile, setIsAudioFile] = useState(false);
  const [audioTranscript, setAudioTranscript] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);

      // Check if it's an audio file
      const audioExtensions = ['.mp3', '.wav', '.m4a', '.ogg', '.flac', '.webm'];
      const fileExt = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
      setIsAudioFile(audioExtensions.includes(fileExt));
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file first');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      let response;

      // Check if it's an audio file
      if (isAudioFile) {
        // Upload to audio endpoint
        response = await axios.post(`${API_BASE_URL}/api/audio/upload`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        // Store transcript and summary
        setAudioTranscript({
          transcript: response.data.data.transcript,
          summary: response.data.data.summary
        });

        setDocumentData(response.data.data);
      } else {
        // Regular document upload
        response = await axios.post(`${API_BASE_URL}/api/upload`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        setDocumentData(response.data.data);
        setAudioTranscript(null);
      }

      // Add to recent documents
      setRecentDocs(prev => [file.name, ...prev.slice(0, 2)]);

      // Auto-analyze after upload
      await handleAnalyze(response.data.data.text);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async (text) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/analyze?text=${encodeURIComponent(text)}`,
        { detect_rights: true }
      );

      setAnalyzedData(response.data.data);
    } catch (error) {
      console.error('Error analyzing document:', error);
      alert('Error analyzing document: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleTranslateSection = async (sectionIdx, sectionHeading) => {
    if (!analyzedData) return;

    const section = analyzedData.segmented_doc.sections[sectionIdx];
    const simplified = analyzedData.simplified_sections?.[section.heading];
    const textToTranslate = simplified?.plain_summary || section.body;

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/translate`, {
        text: textToTranslate,
        target_language: translationLang
      });

      // Store translation for this section
      setSectionTranslations(prev => ({
        ...prev,
        [sectionIdx]: {
          language: translationLang,
          text: response.data.data.translation
        }
      }));
    } catch (error) {
      console.error('Error translating:', error);
      alert('Error translating: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const [expandedSection, setExpandedSection] = useState(null);
  const [viewMode, setViewMode] = useState({}); // 'simplified' or 'original' per section
  const [translationLang, setTranslationLang] = useState('Spanish');
  const [sectionTranslations, setSectionTranslations] = useState({}); // Store translations per section

  const renderRightsDetected = () => {
    if (!analyzedData?.rights || analyzedData.rights.length === 0) return null;

    return (
      <div style={{ padding: '32px', background: 'white', marginBottom: 32 }}>
        <div style={{ fontSize: 32, fontFamily: 'Young Serif', fontWeight: '600', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
          ⚖️ Rights Detected
        </div>

        {analyzedData.rights.map((right, idx) => (
          <div key={idx} style={{
            background: '#FFF8E7',
            border: '3px solid #9D6722',
            borderLeft: '6px solid #9D6722',
            borderRadius: 8,
            padding: 24,
            marginBottom: 24
          }}>
            <div style={{ fontSize: 24, fontFamily: 'Young Serif', fontWeight: '600', color: '#9D6722', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              💎 {right.right_name || 'Legal Right'}
            </div>
            <div style={{ fontSize: 16, fontFamily: 'Albert Sans', marginBottom: 16 }}>
              <strong>Plain Explanation:</strong> {right.explanation || right.plain_explanation}
            </div>
            {right.section_reference && (
              <div style={{ fontSize: 14, fontFamily: 'Albert Sans', color: '#666', marginBottom: 12 }}>
                <strong>Found in:</strong> {right.section_reference}
              </div>
            )}
            <div style={{ background: '#FFF9C4', padding: 12, borderRadius: 4, fontSize: 14, fontFamily: 'Albert Sans' }}>
              ⚠️ <strong>Note:</strong> This is general information, not legal advice. Consult with a qualified attorney for legal advice specific to your situation.
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderSimplifiedSections = () => {
    if (!analyzedData || !analyzedData.segmented_doc) return null;

    const sections = analyzedData.segmented_doc.sections || [];

    return (
      <div style={{ padding: '32px', background: 'white' }}>
        <div style={{ fontSize: 32, fontFamily: 'Young Serif', fontWeight: '600', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
          📝 Simplified Sections
        </div>

        {sections.map((section, idx) => {
          const isExpanded = expandedSection === idx;
          const mode = viewMode[idx] || 'simplified';
          const simplified = analyzedData.simplified_sections?.[section.heading];

          return (
            <div key={idx} style={{
              border: '1px solid #ddd',
              borderRadius: 8,
              marginBottom: 16,
              overflow: 'hidden'
            }}>
              {/* Accordion Header */}
              <div
                onClick={() => setExpandedSection(isExpanded ? null : idx)}
                style={{
                  padding: '20px 24px',
                  background: isExpanded ? '#f5f5f5' : 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: isExpanded ? '1px solid #ddd' : 'none'
                }}
              >
                <div style={{ fontSize: 20, fontFamily: 'Young Serif', fontWeight: '500', display: 'flex', alignItems: 'center', gap: 8 }}>
                  📖 {section.heading}
                </div>
                <div style={{ fontSize: 24 }}>{isExpanded ? '▲' : '▼'}</div>
              </div>

              {/* Accordion Content */}
              {isExpanded && (
                <div style={{ padding: 24, background: 'white' }}>
                  {/* Tabs */}
                  <div style={{ display: 'flex', gap: 16, marginBottom: 20, borderBottom: '2px solid #FFE3BF', paddingBottom: 8 }}>
                    <div
                      onClick={() => setViewMode({ ...viewMode, [idx]: 'simplified' })}
                      style={{
                        fontSize: 16,
                        fontFamily: 'Albert Sans',
                        cursor: 'pointer',
                        color: mode === 'simplified' ? '#9D6722' : '#666',
                        borderBottom: mode === 'simplified' ? '3px solid #9D6722' : 'none',
                        paddingBottom: 8,
                        fontWeight: mode === 'simplified' ? '600' : '400'
                      }}
                    >
                      ✨ Simplified
                    </div>
                    <div
                      onClick={() => setViewMode({ ...viewMode, [idx]: 'original' })}
                      style={{
                        fontSize: 16,
                        fontFamily: 'Albert Sans',
                        cursor: 'pointer',
                        color: mode === 'original' ? '#9D6722' : '#666',
                        borderBottom: mode === 'original' ? '3px solid #9D6722' : 'none',
                        paddingBottom: 8,
                        fontWeight: mode === 'original' ? '600' : '400'
                      }}
                    >
                      📄 Original
                    </div>
                  </div>

                  {mode === 'simplified' && simplified ? (
                    <div>
                      <div style={{ background: '#FFF8E7', padding: 16, borderRadius: 8, marginBottom: 16, border: '1px solid #FFE3BF' }}>
                        <div style={{ fontSize: 14, fontFamily: 'Albert Sans', fontWeight: '600', marginBottom: 8 }}>
                          Plain Language Summary:
                        </div>
                        <div style={{ fontSize: 16, fontFamily: 'Albert Sans', lineHeight: 1.6 }}>
                          {simplified.plain_summary}
                        </div>
                      </div>

                      {/* Show translation if available */}
                      {sectionTranslations[idx] && (
                        <div style={{ background: '#FFF9E6', padding: 16, borderRadius: 8, marginBottom: 16, border: '2px solid #FFD700' }}>
                          <div style={{ fontSize: 14, fontFamily: 'Albert Sans', fontWeight: '600', marginBottom: 8, color: '#9D6722' }}>
                            🌐 Translation ({sectionTranslations[idx].language}):
                          </div>
                          <div style={{ fontSize: 16, fontFamily: 'Albert Sans', lineHeight: 1.6 }}>
                            {sectionTranslations[idx].text}
                          </div>
                        </div>
                      )}

                      {simplified.key_points && simplified.key_points.length > 0 && (
                        <div style={{ marginBottom: 16 }}>
                          <div style={{ fontSize: 14, fontFamily: 'Albert Sans', fontWeight: '600', marginBottom: 8 }}>
                            Key Points:
                          </div>
                          <ul style={{ fontSize: 16, fontFamily: 'Albert Sans', lineHeight: 1.8, paddingLeft: 24 }}>
                            {simplified.key_points.map((point, i) => (
                              <li key={i}>{point}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {simplified.ambiguous_terms && simplified.ambiguous_terms.length > 0 ? (
                        <div style={{ background: '#FFF9C4', padding: 16, borderRadius: 8 }}>
                          <div style={{ fontSize: 14, fontFamily: 'Albert Sans', fontWeight: '600', marginBottom: 8 }}>
                            ⚠️ Ambiguous Terms:
                          </div>
                          <ul style={{ fontSize: 14, fontFamily: 'Albert Sans', lineHeight: 1.6, paddingLeft: 24, margin: 0 }}>
                            {simplified.ambiguous_terms.map((term, i) => (
                              <li key={i}><strong>{term.term || 'Term'}:</strong> {term.explanation || term}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <div style={{ fontSize: 16, fontFamily: 'Albert Sans', lineHeight: 1.8, color: '#333' }}>
                      {section.body}
                    </div>
                  )}

                  {/* Translation Section */}
                  <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid #eee' }}>
                    <div style={{ fontSize: 16, fontFamily: 'Albert Sans', fontWeight: '600', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                      🌐 Translations:
                    </div>
                    <div style={{ fontSize: 14, fontFamily: 'Albert Sans', marginBottom: 8 }}>
                      Select language to view
                    </div>
                    <select
                      value={translationLang}
                      onChange={(e) => setTranslationLang(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        fontSize: 16,
                        fontFamily: 'Albert Sans',
                        border: '1px solid #ddd',
                        borderRadius: 4,
                        background: 'white'
                      }}
                    >
                      <option>Spanish</option>
                      <option>French</option>
                      <option>Mandarin</option>
                      <option>Arabic</option>
                    </select>
                    <button
                      onClick={() => handleTranslateSection(idx, section.heading)}
                      disabled={loading}
                      style={{
                        marginTop: 12,
                        padding: '10px 20px',
                        background: sectionTranslations[idx] ? '#9D6722' : '#FFD388',
                        color: sectionTranslations[idx] ? 'white' : 'black',
                        border: '1px solid #9D6722',
                        borderRadius: 4,
                        fontSize: 14,
                        fontFamily: 'Albert Sans',
                        cursor: loading ? 'wait' : 'pointer',
                        opacity: loading ? 0.6 : 1
                      }}
                    >
                      {loading ? 'Translating...' : sectionTranslations[idx] ? '✓ Translated' : `Translate to ${translationLang}`}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div style={{ width: '100%', minHeight: '100vh', position: 'relative', background: '#070739', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Top navigation bar */}
      <div style={{ width: '100%', height: 48, position: 'fixed', top: 0, background: 'black', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: 1440, display: 'flex', justifyContent: 'space-between', padding: '0 32px', alignItems: 'center' }}>
          <img src={logoSvg} alt="LegisLight" style={{ height: 32 }} />
          <div style={{ width: 32 }} />
        </div>
      </div>

      {/* Centered Menu Button */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 101,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          cursor: 'pointer',
          background: 'black',
          padding: '12px 24px',
          borderRadius: '0 0 12px 12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
        }}
        onClick={() => setShowMenu(!showMenu)}
      >
        <span style={{ color: 'white', fontSize: 20, fontFamily: 'Young Serif' }}>Menu</span>
        <span style={{ color: 'white', fontSize: 20 }}>{showMenu ? '▲' : '▼'}</span>
      </div>

      {/* Render menu or content based on state */}
      {showMenu ? (
        // Menu overlay
        <div style={{ position: 'fixed', top: 48, left: 0, width: '100%', height: 'calc(100vh - 48px)', background: 'rgba(7, 7, 57, 0.40)', backdropFilter: 'blur(2px)', zIndex: 50, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ width: '100%', maxWidth: 1155, height: 650, background: 'white', borderRadius: 12, position: 'relative' }}>
            {/* Three Cards Container */}
            <div style={{ display: 'flex', gap: 16, padding: 32, justifyContent: 'center' }}>

              {/* Quick Start Card */}
              <div style={{ width: 353, background: '#FFF2E1', borderRadius: 12, border: '1px #9D6722 solid', padding: 32 }}>
                <div style={{ color: 'black', fontSize: 28, fontFamily: 'Young Serif', fontWeight: '400', marginBottom: 16 }}>
                  Quick Start
                </div>
                <div style={{ color: 'black', fontSize: 20, fontFamily: 'Albert Sans', fontWeight: '400', marginBottom: 48 }}>
                  Not sure where to start? Click here to find out more about this website and how it works.
                </div>
                {/* Question mark icon */}
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 48 }}>
                  <img src={questionImgSvg} alt="Question" style={{ width: 150, height: 'auto' }} />
                </div>
              </div>

              {/* Upload Documents Card */}
              <div style={{ width: 353, background: '#FFF2E1', borderRadius: 12, border: '1px #9D6722 solid', padding: 32 }}>
                <div style={{ color: 'black', fontSize: 28, fontFamily: 'Young Serif', fontWeight: '400', marginBottom: 16 }}>
                  Upload Documents
                </div>
                <div style={{ color: 'black', fontSize: 20, fontFamily: 'Albert Sans', fontWeight: '400', marginBottom: 32 }}>
                  Upload your legal documents and get a summary of the laws relevant to your case.
                </div>

                {/* Drag & Drop button */}
                <button
                  onClick={() => setShowMenu(false)}
                  style={{
                    width: '100%',
                    height: 77,
                    background: '#FFE3BF',
                    borderRadius: 12,
                    border: '1px solid #9D6722',
                    color: 'black',
                    fontSize: 24,
                    fontFamily: 'Albert Sans',
                    fontWeight: '400',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    marginBottom: 24
                  }}
                >
                  Drag & Drop or Upload
                  <span style={{ fontSize: 28 }}>↑</span>
                </button>

                {/* Document preview illustration */}
                <div style={{
                  width: '100%',
                  height: 280,
                  background: '#FFD388',
                  borderRadius: 12,
                  padding: 24,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  gap: 16
                }}>
                  {/* Document lines */}
                  <div style={{ width: '30%', height: 8, background: '#9D6722', borderRadius: 4 }} />
                  <div style={{ width: '25%', height: 8, background: '#9D6722', borderRadius: 4 }} />
                  <div style={{ width: '85%', height: 8, background: '#9D6722', borderRadius: 4, marginTop: 8 }} />
                  <div style={{ width: '80%', height: 8, background: '#9D6722', borderRadius: 4 }} />
                  <div style={{ width: '70%', height: 8, background: '#9D6722', borderRadius: 4 }} />
                  <div style={{ width: '85%', height: 8, background: '#9D6722', borderRadius: 4 }} />
                  <div style={{ width: '75%', height: 8, background: '#9D6722', borderRadius: 4 }} />
                </div>
              </div>

              {/* Language Card */}
              <div style={{ width: 353, background: '#FFF2E1', borderRadius: 12, border: '1px #9D6722 solid', padding: 32 }}>
                <div style={{ color: 'black', fontSize: 28, fontFamily: 'Young Serif', fontWeight: '400', marginBottom: 16 }}>
                  Language
                </div>
                <div style={{ color: 'black', fontSize: 20, fontFamily: 'Albert Sans', fontWeight: '400', marginBottom: 16 }}>
                  Select your spoken language.
                </div>

                {/* Language dropdown */}
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  style={{
                    width: '100%',
                    height: 40,
                    background: '#FFE3BF',
                    borderRadius: 12,
                    border: '1px #9D6722 solid',
                    color: 'black',
                    fontSize: 20,
                    fontFamily: 'Albert Sans',
                    padding: '0 16px',
                    marginBottom: 32
                  }}
                >
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                  <option>Mandarin</option>
                  <option>Arabic</option>
                </select>

                {/* Last Document section */}
                <div style={{ color: 'black', fontSize: 28, fontFamily: 'Young Serif', fontWeight: '400', marginBottom: 16 }}>
                  Last Document
                </div>

                {recentDocs.length > 0 ? recentDocs.map((doc, i) => (
                  <div key={i} style={{ height: 40, background: '#FFE3BF', borderRadius: 12, border: '1px #9D6722 solid', marginBottom: 8, display: 'flex', alignItems: 'center', padding: '0 14px' }}>
                    <div style={{ color: 'black', fontSize: 20, fontFamily: 'Albert Sans', fontWeight: '400' }}>
                      {i + 1}. {doc.substring(0, 15)}...
                    </div>
                  </div>
                )) : (
                  <div style={{ color: 'black', fontSize: 16, fontFamily: 'Albert Sans', opacity: 0.5 }}>
                    No recent documents
                  </div>
                )}

                {/* Mission section */}
                <div style={{ marginTop: 48 }}>
                  <div style={{ color: 'black', fontSize: 28, fontFamily: 'Young Serif', fontWeight: '400', marginBottom: 16 }}>
                    Mission
                  </div>
                  <div style={{ color: 'black', fontSize: 20, fontFamily: 'Albert Sans', fontWeight: '400' }}>
                    The goal of LegisLight is to provide people with an accessible interpretation of the law.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Main content - scrollable analysis view */}
      <div style={{ width: '100%', maxWidth: 1200, marginTop: 80, padding: '0 24px', paddingBottom: 200 }}>
        {analyzedData ? (
          <>
            {/* Audio Transcript Section */}
            {audioTranscript && (
              <div style={{ padding: '32px', background: 'white', marginBottom: 32, borderRadius: 12 }}>
                <div style={{ fontSize: 32, fontFamily: 'Young Serif', fontWeight: '600', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
                  🎵 Audio Transcript
                </div>

                {/* Summary */}
                <div style={{
                  background: '#FFF8E7',
                  border: '2px solid #9D6722',
                  borderRadius: 12,
                  padding: 24,
                  marginBottom: 24
                }}>
                  <div style={{ fontSize: 24, fontFamily: 'Young Serif', fontWeight: '600', color: '#9D6722', marginBottom: 16 }}>
                    📝 Summary
                  </div>
                  <div style={{ fontSize: 16, fontFamily: 'Albert Sans', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                    {audioTranscript.summary}
                  </div>
                </div>

                {/* Full Transcript */}
                <div style={{
                  background: '#F5F5F5',
                  border: '1px solid #ddd',
                  borderRadius: 8,
                  padding: 24,
                  maxHeight: 400,
                  overflowY: 'auto'
                }}>
                  <div style={{ fontSize: 18, fontFamily: 'Young Serif', fontWeight: '600', marginBottom: 12 }}>
                    Full Transcript
                  </div>
                  <div style={{ fontSize: 15, fontFamily: 'Albert Sans', lineHeight: 1.8, color: '#333', whiteSpace: 'pre-wrap' }}>
                    {audioTranscript.transcript}
                  </div>
                </div>
              </div>
            )}

            {/* Rights Detected Section */}
            {renderRightsDetected()}

            {/* Simplified Sections */}
            {renderSimplifiedSections()}

            {/* Disclaimer Footer */}
            <div style={{
              background: '#FFE3BF',
              border: '2px solid #9D6722',
              borderRadius: 12,
              padding: 32,
              marginTop: 48,
              marginBottom: 32
            }}>
              <div style={{ fontSize: 24, fontFamily: 'Young Serif', fontWeight: '600', marginBottom: 16, color: '#9D6722' }}>
                ⚠️ Important Disclaimer
              </div>
              <div style={{ fontSize: 16, fontFamily: 'Albert Sans', lineHeight: 1.8, color: '#333' }}>
                This tool provides general information and plain-language summaries of legal documents. It does <strong>NOT</strong> provide legal advice. The information presented here is for educational and informational purposes only. Always consult with a qualified attorney for legal advice specific to your situation. Do not rely on this tool as a substitute for professional legal counsel.
              </div>
            </div>

            {/* Action Buttons at Bottom */}
            <div style={{
              display: 'flex',
              gap: 16,
              justifyContent: 'center',
              marginBottom: 48,
              flexWrap: 'wrap'
            }}>
              {/* Upload Document Button */}
              <input
                type="file"
                id="bottom-file-upload"
                style={{ display: 'none' }}
                onChange={async (e) => {
                  if (e.target.files) {
                    const selectedFile = e.target.files[0];
                    setFile(selectedFile);

                    // Check if it's an audio file
                    const audioExtensions = ['.mp3', '.wav', '.m4a', '.ogg', '.flac', '.webm'];
                    const fileExt = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
                    const isAudio = audioExtensions.includes(fileExt);
                    setIsAudioFile(isAudio);

                    // Auto-upload and analyze
                    if (selectedFile) {
                      setLoading(true);
                      const formData = new FormData();
                      formData.append('file', selectedFile);

                      try {
                        let response;

                        if (isAudio) {
                          // Upload audio file
                          response = await axios.post(`${API_BASE_URL}/api/audio/upload`, formData, {
                            headers: {
                              'Content-Type': 'multipart/form-data',
                            },
                          });

                          setAudioTranscript({
                            transcript: response.data.data.transcript,
                            summary: response.data.data.summary
                          });
                        } else {
                          // Upload document
                          response = await axios.post(`${API_BASE_URL}/api/upload`, formData, {
                            headers: {
                              'Content-Type': 'multipart/form-data',
                            },
                          });

                          setAudioTranscript(null);
                        }

                        setDocumentData(response.data.data);
                        setRecentDocs(prev => [selectedFile.name, ...prev.slice(0, 2)]);

                        // Auto-analyze after upload
                        await handleAnalyze(response.data.data.text);

                        // Reset states
                        setSectionTranslations({});
                        setExpandedSection(null);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      } catch (error) {
                        console.error('Error uploading file:', error);
                        alert('Error uploading file: ' + (error.response?.data?.detail || error.message));
                      } finally {
                        setLoading(false);
                      }
                    }
                  }
                }}
                accept=".pdf,.txt,.docx,.mp3,.wav,.m4a,.ogg,.flac,.webm"
              />
              <label
                htmlFor="bottom-file-upload"
                style={{
                  minWidth: 240,
                  height: 60,
                  background: '#FFF2E1',
                  borderRadius: 12,
                  border: '2px solid #9D6722',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8
                }}
              >
                <div style={{
                  color: 'black',
                  fontSize: 24,
                  fontFamily: 'Young Serif',
                  fontWeight: '400'
                }}>
                  Upload New Document
                </div>
                <div style={{ fontSize: 24 }}>↑</div>
              </label>
            </div>
          </>
        ) : (
          <div style={{
            background: 'white',
            padding: 80,
            borderRadius: 12,
            textAlign: 'center',
            marginTop: 100,
            maxWidth: 600,
            margin: '100px auto'
          }}>
            <div style={{ fontSize: 48, marginBottom: 24 }}>📄</div>
            <div style={{ fontSize: 24, fontFamily: 'Young Serif', marginBottom: 16 }}>
              No Document Analyzed Yet
            </div>
            <div style={{ fontSize: 16, fontFamily: 'Albert Sans', color: '#666', marginBottom: 32 }}>
              Upload a legal document to get started with AI-powered analysis
            </div>

            {/* Upload Area */}
            <input
              type="file"
              id="main-file-upload"
              style={{ display: 'none' }}
              onChange={handleFileChange}
              accept=".pdf,.txt,.docx,.mp3,.wav,.m4a,.ogg,.flac,.webm"
            />
            <label
              htmlFor="main-file-upload"
              style={{
                width: '100%',
                minHeight: 180,
                background: '#FFF2E1',
                borderRadius: 12,
                border: '2px dashed #9D6722',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 16,
                marginBottom: 24,
                padding: '32px 24px',
                boxSizing: 'border-box',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#FFE3BF';
                e.currentTarget.style.borderColor = '#8B5A1E';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#FFF2E1';
                e.currentTarget.style.borderColor = '#9D6722';
              }}
            >
              <img src={uploadArrowSvg} alt="Upload" style={{ width: 40, height: 50, marginBottom: 8 }} />
              <div style={{
                color: '#9D6722',
                fontSize: 22,
                fontFamily: 'Young Serif',
                fontWeight: '400',
                textAlign: 'center',
                maxWidth: '90%',
                wordWrap: 'break-word'
              }}>
                {file ? '✓ ' + file.name : 'Click to Upload or Drag & Drop'}
              </div>
              <div style={{
                fontSize: 15,
                fontFamily: 'Albert Sans',
                color: '#666',
                textAlign: 'center'
              }}>
                {isAudioFile && file ? 'Audio file selected 🎵' : 'Documents (PDF, DOCX, TXT) or Audio (MP3, WAV, M4A)'}
              </div>
            </label>

            {/* Analyze Button */}
            {file && (
              <button
                onClick={handleUpload}
                disabled={loading}
                style={{
                  width: '100%',
                  height: 60,
                  background: '#9D6722',
                  borderRadius: 12,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 24,
                  fontFamily: 'Young Serif',
                  color: 'white'
                }}
              >
                {loading ? 'Processing...' : 'Analyze Document'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Loading overlay */}
      {loading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '8px',
            fontFamily: 'Young Serif',
            fontSize: '24px'
          }}>
            {loading && 'Processing...'}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
