import { useState } from 'react';
import axios from 'axios';
import './App.css';
import logoSvg from './assets/logo.svg';
import uploadArrowSvg from './assets/upload-arrow.svg';
import ellipsesSvg from './assets/ellipses.svg';

const API_BASE_URL = 'http://localhost:8000';

function App() {
  const [file, setFile] = useState(null);
  const [documentData, setDocumentData] = useState(null);
  const [analyzedData, setAnalyzedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [showTranslations, setShowTranslations] = useState(false);
  const [translatedContent, setTranslatedContent] = useState({});

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
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
      const response = await axios.post(`${API_BASE_URL}/api/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setDocumentData(response.data.data);
      
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

  const handleTranslateAll = async () => {
    if (!analyzedData || !analyzedData.segmented_doc) return;
    
    setLoading(true);
    try {
      const sections = analyzedData.segmented_doc.sections;
      const translations = {};
      
      // Translate first 3 sections to Spanish
      for (let i = 0; i < Math.min(3, sections.length); i++) {
        const section = sections[i];
        const simplified = analyzedData.simplified_sections[section.heading];
        const textToTranslate = simplified?.plain_summary || section.body;
        
        const response = await axios.post(`${API_BASE_URL}/api/translate`, {
          text: textToTranslate,
          target_language: 'Spanish'
        });
        
        translations[section.heading] = response.data.data.translation;
      }
      
      setTranslatedContent(translations);
      setShowTranslations(true);
    } catch (error) {
      console.error('Error translating:', error);
      alert('Error translating: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const renderSections = () => {
    if (!analyzedData || !analyzedData.segmented_doc) return null;

    const sections = analyzedData.segmented_doc.sections || [];
    const sectionsToShow = sections.slice(0, 3); // Show first 3 sections

    return (
      <div style={{padding: '0 48px', position: 'relative', width: '100%'}}>
        {/* First Section */}
        {sectionsToShow[0] && (
          <div style={{marginTop: 48}}>
            <div style={{
              color: 'black',
              fontSize: 24,
              fontFamily: 'Young Serif',
              fontWeight: '400',
              textDecoration: 'underline',
              wordWrap: 'break-word',
              marginBottom: 16
            }}>
              {sectionsToShow[0].heading}
            </div>
            <div style={{
              color: 'black',
              fontSize: 20,
              fontFamily: 'Albert Sans',
              fontWeight: '400',
              wordWrap: 'break-word',
              maxHeight: 144,
              overflow: 'hidden',
              lineHeight: 1.5
            }}>
              {showTranslations && translatedContent[sectionsToShow[0].heading] 
                ? translatedContent[sectionsToShow[0].heading]
                : analyzedData.simplified_sections[sectionsToShow[0].heading]?.plain_summary || sectionsToShow[0].body.substring(0, 500) + '...'}
            </div>
          </div>
        )}

        {/* Second Section */}
        {sectionsToShow[1] && (
          <div style={{marginTop: 64}}>
            <div style={{
              color: 'black',
              fontSize: 24,
              fontFamily: 'Young Serif',
              fontWeight: '400',
              textDecoration: 'underline',
              wordWrap: 'break-word',
              marginBottom: 16
            }}>
              {sectionsToShow[1].heading}
            </div>
            <div style={{
              color: 'black',
              fontSize: 20,
              fontFamily: 'Albert Sans',
              fontWeight: '400',
              wordWrap: 'break-word',
              maxHeight: 144,
              overflow: 'hidden',
              lineHeight: 1.5
            }}>
              {showTranslations && translatedContent[sectionsToShow[1].heading]
                ? translatedContent[sectionsToShow[1].heading]
                : analyzedData.simplified_sections[sectionsToShow[1].heading]?.plain_summary || sectionsToShow[1].body.substring(0, 500) + '...'}
            </div>
          </div>
        )}

        {/* Third Section */}
        {sectionsToShow[2] && (
          <div style={{marginTop: 64}}>
            <div style={{
              color: 'black',
              fontSize: 24,
              fontFamily: 'Young Serif',
              fontWeight: '400',
              textDecoration: 'underline',
              wordWrap: 'break-word',
              marginBottom: 16
            }}>
              {sectionsToShow[2].heading}
            </div>
            <div style={{
              color: 'black',
              fontSize: 20,
              fontFamily: 'Albert Sans',
              fontWeight: '400',
              wordWrap: 'break-word',
              maxHeight: 144,
              overflow: 'hidden',
              lineHeight: 1.5
            }}>
              {showTranslations && translatedContent[sectionsToShow[2].heading]
                ? translatedContent[sectionsToShow[2].heading]
                : analyzedData.simplified_sections[sectionsToShow[2].heading]?.plain_summary || sectionsToShow[2].body.substring(0, 500) + '...'}
            </div>
          </div>
        )}

        {/* Pagination dots */}
        <div style={{marginTop: 48, display: 'flex', gap: 8}}>
          <div style={{width: 16, height: 16, borderRadius: 9999, border: '2px black solid', backgroundColor: currentPage === 0 ? 'black' : 'transparent', cursor: 'pointer'}} onClick={() => setCurrentPage(0)} />
          <div style={{width: 16, height: 16, borderRadius: 9999, border: '2px black solid', backgroundColor: currentPage === 1 ? 'black' : 'transparent', cursor: 'pointer'}} onClick={() => setCurrentPage(1)} />
          <div style={{width: 16, height: 16, borderRadius: 9999, border: '2px black solid', backgroundColor: currentPage === 2 ? 'black' : 'transparent', cursor: 'pointer'}} onClick={() => setCurrentPage(2)} />
        </div>
      </div>
    );
  };

  return (
    <div style={{width: '100%', minHeight: '100vh', position: 'relative', background: '#070739', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      {/* Top navigation bar */}
      <div style={{width: '100%', height: 48, position: 'fixed', top: 0, background: 'black', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        <div style={{width: '100%', maxWidth: 1440, display: 'flex', justifyContent: 'space-between', padding: '0 32px', alignItems: 'center'}}>
          <img src={logoSvg} alt="LegisLight" style={{height: 32}} />
          <img src={ellipsesSvg} alt="Menu" style={{height: 16, cursor: 'pointer'}} />
        </div>
      </div>

      {/* Main content container - centered */}
      <div style={{width: '100%', maxWidth: 1200, marginTop: 48, position: 'relative', minHeight: 976}}>
        {/* Yellow background area */}
        <div style={{width: '100%', height: 976, position: 'absolute', background: '#FFD388', borderRadius: 0}} />
        
        {/* White content area - centered */}
        <div style={{width: 'calc(100% - 32px)', height: 976, position: 'absolute', left: 16, background: 'white', borderRadius: 0}} />
      
        {/* Gradient overlay */}
        <div style={{width: '100%', height: 120, bottom: 0, position: 'absolute', background: 'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, #DCDCDC 100%)'}} />
        
        {/* Buttons container at bottom */}
        <div style={{position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 16, alignItems: 'center'}}>
          {/* Upload button */}
          <input
            type="file"
            id="file-upload"
            style={{display: 'none'}}
            onChange={handleFileChange}
            accept=".pdf,.txt,.docx"
          />
          <label
            htmlFor="file-upload"
            style={{
              width: 333,
              height: 72,
              background: '#FFF2E1',
              borderRadius: 8,
              outline: '1px #9D6722 solid',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div style={{
              color: 'black',
              fontSize: 28,
              fontFamily: 'Young Serif',
              fontWeight: '400',
              wordWrap: 'break-word'
            }}>
              {file ? '✓ ' + file.name.substring(0, 12) : 'Upload Document'}
            </div>
          </label>

          {/* Upload icon */}
          <img src={uploadArrowSvg} alt="Upload" style={{width: 18, height: 26}} />
          
          {/* Translate/Analyze button */}
          {analyzedData ? (
            <button
              onClick={handleTranslateAll}
              disabled={loading}
              style={{
                width: 193,
                height: 72,
                background: showTranslations ? '#9D6722' : '#FFF2E1',
                borderRadius: 8,
                outline: '1px #9D6722 solid',
                cursor: 'pointer',
                border: 'none'
              }}
            >
              <div style={{
                color: showTranslations ? 'white' : 'black',
                fontSize: 28,
                fontFamily: 'Young Serif',
                fontWeight: '400',
                wordWrap: 'break-word'
              }}>
                {loading ? '...' : showTranslations ? 'Original' : 'Translate'}
              </div>
            </button>
          ) : file && (
            <button
              onClick={handleUpload}
              disabled={loading}
              style={{
                width: 193,
                height: 72,
                background: '#9D6722',
                borderRadius: 8,
                outline: '1px #9D6722 solid',
                cursor: 'pointer',
                border: 'none'
              }}
            >
              <div style={{
                color: 'white',
                fontSize: 28,
                fontFamily: 'Young Serif',
                fontWeight: '400',
                wordWrap: 'break-word'
              }}>
                {loading ? 'Processing...' : 'Analyze'}
              </div>
        </button>
          )}
        </div>

        {/* Document sections */}
        {renderSections()}
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
