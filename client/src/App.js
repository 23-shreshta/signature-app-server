import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import {
  Box,
  Button,
  Container,
  Typography,
  TextField,
  Select,
  MenuItem,
  Paper,
  AppBar,
  Toolbar,
  CssBaseline,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  IconButton,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import LogoutIcon from '@mui/icons-material/Logout';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import './App.css';
import Login from './components/Login';
import Signup from './components/Signup';

pdfjs.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@2.16.105/build/pdf.worker.min.js';

const FONT_OPTIONS = [
  { label: 'Pacifico', value: 'Pacifico, cursive' },
  { label: 'Monsieur La Doulaise', value: 'Monsieur La Doulaise, cursive' },
  { label: 'Kirang Haerang', value: 'Kirang Haerang, cursive' },
  { label: 'Indie Flower', value: 'Indie Flower, cursive' },
  { label: 'Henny Penny', value: 'Henny Penny, cursive' },
  { label: 'Comforter Brush', value: 'Comforter Brush, cursive' },
  { label: 'Barriecito', value: 'Barriecito, cursive' },
  { label: 'Playwrite AU SA', value: 'Playwrite AU SA, cursive' },
  { label: 'Passions Conflict', value: 'Passions Conflict, cursive' },
  { label: 'Mountains of Christmas', value: 'Mountains of Christmas, cursive' },
];

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [showSignup, setShowSignup] = useState(false);
  const [file, setFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [typedName, setTypedName] = useState('');
  const [selectedFont, setSelectedFont] = useState(FONT_OPTIONS[0].value);
  const [dragged, setDragged] = useState(false);
  const [droppedPosition, setDroppedPosition] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [pdfError, setPdfError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Check for existing authentication on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setIsAuthenticated(true);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleSignup = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    setFile(null);
    setDroppedPosition(null);
  };

  const handleSwitchToSignup = () => {
    setShowSignup(true);
  };

  const handleSwitchToLogin = () => {
    setShowSignup(false);
  };

  function onFileChange(event) {
    const selectedFile = event.target.files[0];
    
    if (!selectedFile) {
      return;
    }

    // Validate file type
    if (selectedFile.type !== 'application/pdf') {
      setSnackbarMessage('Please select a valid PDF file.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      event.target.value = ''; // Reset input
      return;
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (selectedFile.size > maxSize) {
      setSnackbarMessage('File size must be less than 10MB.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      event.target.value = ''; // Reset input
      return;
    }

    setFile(selectedFile);
    setDroppedPosition(null);
    setPdfError(null);
    setNumPages(null);
  }

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setPdfError(null);
  }

  function onDocumentLoadError(error) {
    console.error('PDF loading error:', error);
    setPdfError('Failed to load PDF. Please ensure the file is valid and try again.');
    setFile(null);
    setSnackbarMessage('Failed to load PDF. Please try a different file.');
    setSnackbarSeverity('error');
    setSnackbarOpen(true);
  }

  // Drag handlers for typed signature
  function handleDragStart(e) {
    setDragged(true);
  }
  function handleDragEnd() {
    setDragged(false);
  }

  // Drop handlers for PDF overlay
  function handleDrop(e) {
    e.preventDefault();
    setDragged(false);
    const overlayRect = e.target.getBoundingClientRect();
    const x = e.clientX - overlayRect.left;
    const y = e.clientY - overlayRect.top;
    setDroppedPosition({ x, y });
  }
  function handleDragOver(e) {
    e.preventDefault();
  }

  const handleSignPdf = async () => {
    // Validation
    if (!file) {
      setSnackbarMessage('Please upload a PDF file.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    if (!typedName || typedName.trim().length === 0) {
      setSnackbarMessage('Please type your signature name.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    if (typedName.length > 100) {
      setSnackbarMessage('Signature name must be less than 100 characters.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    if (!droppedPosition) {
      setSnackbarMessage('Please place your signature on the PDF by dragging it.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    if (!numPages) {
      setSnackbarMessage('PDF is still loading. Please wait.');
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
      return;
    }

    setLoading(true);
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('signatureText', typedName.trim());
    formData.append('font', selectedFont);
    formData.append('x', droppedPosition.x);
    formData.append('y', droppedPosition.y);
    formData.append('page', 1);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/sign-pdf`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.status === 401) {
        setSnackbarMessage('Session expired. Please log in again.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        handleLogout();
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to sign PDF' }));
        throw new Error(errorData.error || errorData.message || 'Failed to sign PDF');
      }

      const blob = await response.blob();
      
      // Validate response is a PDF
      if (blob.type !== 'application/pdf') {
        throw new Error('Server returned an invalid file.');
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `signed-${file.name || 'document.pdf'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      setSnackbarMessage('Signed PDF downloaded successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error signing PDF:', error);
      setSnackbarMessage(error.message || 'An error occurred while signing the PDF. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  // Show authentication pages if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <CssBaseline />
        {showSignup ? (
          <Signup onSignup={handleSignup} onSwitchToLogin={handleSwitchToLogin} />
        ) : (
          <Login onLogin={handleLogin} onSwitchToSignup={handleSwitchToSignup} />
        )}
      </>
    );
  }

  // Show PDF signing app if authenticated
  return (
    <>
      <CssBaseline />
      <AppBar position="static" color="primary" elevation={2} sx={{ borderRadius: 2, mt: 2, mx: 'auto', maxWidth: 900 }}>
        <Toolbar>
          <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: 1 }}>
            PDF Signature App
          </Typography>
          <Typography variant="body1" sx={{ mr: 2 }}>
            Welcome, {user?.name}!
          </Typography>
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Container maxWidth="md" sx={{ mt: 6, mb: 6 }}>
        <Paper elevation={3} sx={{ p: { xs: 2, md: 5 }, mt: 4, borderRadius: 4 }}>
          <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={6}>
            <Box flex={1}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                1. Upload PDF
              </Typography>
              <Button
                variant="contained"
                component="label"
                startIcon={<CloudUploadIcon />}
                sx={{ mb: 2, borderRadius: 3, fontWeight: 600, fontSize: '1rem' }}
              >
                Choose PDF
                <input
                  type="file"
                  accept="application/pdf"
                  hidden
                  onChange={onFileChange}
                />
              </Button>
              {file && (
                <Box mt={2} position="relative" width="100%" maxWidth={500} mx="auto">
                  {pdfError ? (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {pdfError}
                    </Alert>
                  ) : (
                    <Document
                      file={file}
                      onLoadSuccess={onDocumentLoadSuccess}
                      onLoadError={onDocumentLoadError}
                      loading={
                        <Box sx={{ p: 3, textAlign: 'center' }}>
                          <Typography>Loading PDF...</Typography>
                        </Box>
                      }
                    >
                      {numPages && Array.from(new Array(numPages), (el, index) => (
                        <Page key={`page_${index + 1}`} pageNumber={index + 1} width={500} />
                      ))}
                    </Document>
                  )}
                  {/* Overlay for drop area */}
                  <Box
                    className={`signature-overlay${dragged ? ' dragged' : ''}`}
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      zIndex: 10,
                      cursor: dragged ? 'copy' : 'default',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      pointerEvents: 'auto',
                    }}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                  >
                    {!droppedPosition && (
                      <Typography color="primary" fontWeight={500}>
                        Drag your signature here
                      </Typography>
                    )}
                    {/* Render dropped signature at position */}
                    {droppedPosition && typedName && (
                      <span
                        style={{
                          position: 'absolute',
                          left: droppedPosition.x,
                          top: droppedPosition.y,
                          fontFamily: selectedFont,
                          fontSize: '2rem',
                          background: 'rgba(255,255,255,0.85)',
                          color: '#222',
                          border: '1.5px dashed #1976d2',
                          borderRadius: '8px',
                          padding: '0.5rem 1.5rem',
                          pointerEvents: 'none',
                          boxShadow: '0 2px 8px rgba(25, 118, 210, 0.08)',
                          transform: 'translate(-50%, -50%)',
                        }}
                      >
                        {typedName}
                      </span>
                    )}
                  </Box>
                </Box>
              )}
            </Box>
            <Box flex={1}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                2. Type Your Signature
              </Typography>
              <TextField
                label="Your Name"
                variant="outlined"
                fullWidth
                value={typedName}
                onChange={e => setTypedName(e.target.value)}
                inputProps={{ maxLength: 100 }}
                helperText={`${typedName.length}/100 characters`}
                sx={{ mb: 2, borderRadius: 2 }}
              />
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="font-select-label">Font Style</InputLabel>
                <Select
                  labelId="font-select-label"
                  value={selectedFont}
                  label="Font Style"
                  onChange={e => setSelectedFont(e.target.value)}
                >
                  {FONT_OPTIONS.map(font => (
                    <MenuItem key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                      {font.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Typography variant="subtitle1" gutterBottom fontWeight={500}>
                Preview:
              </Typography>
              <Box className="signature-preview">
                {typedName ? (
                  <span
                    style={{
                      fontFamily: selectedFont,
                      fontSize: '2rem',
                      color: '#1976d2',
                      fontWeight: 500,
                      letterSpacing: 1,
                      cursor: 'grab',
                    }}
                    draggable
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                  >
                    {typedName}
                  </span>
                ) : (
                  <Typography color="text.secondary">Type your name above</Typography>
                )}
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Drag and drop your styled signature onto the PDF preview.
              </Typography>
            </Box>
          </Box>
          <Box mt={4} display="flex" justifyContent="center">
            <Button
              variant="contained"
              color="success"
              endIcon={<DownloadIcon />}
              onClick={handleSignPdf}
              disabled={loading || !file || !typedName || !droppedPosition}
              sx={{ px: 4, py: 1.5, borderRadius: 3, fontWeight: 600, fontSize: '1.1rem' }}
            >
              {loading ? 'Signing PDF...' : 'Download Signed PDF'}
            </Button>
          </Box>
        </Paper>
      </Container>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity} 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
}

export default App;
