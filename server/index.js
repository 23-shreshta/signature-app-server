require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs');
const fontkit = require('@pdf-lib/fontkit');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const { protect } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// Connect to database
connectDB();

app.use(cors({
  origin: [CLIENT_URL, 'http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json());

// Set up Multer for file uploads with validation
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { 
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

const fontMap = {
  'Pacifico, cursive': 'Pacifico/Pacifico-Regular.ttf',
  'Monsieur La Doulaise, cursive': 'Monsieur_La_Doulaise/MonsieurLaDoulaise-Regular.ttf',
  'Kirang Haerang, cursive': 'Kirang_Haerang/KirangHaerang-Regular.ttf',
  'Indie Flower, cursive': 'Indie_Flower/IndieFlower-Regular.ttf',
  'Henny Penny, cursive': 'Henny_Penny/HennyPenny-Regular.ttf',
  'Comforter Brush, cursive': 'Comforter_Brush/ComforterBrush-Regular.ttf',
  'Barriecito, cursive': 'Barriecito/Barriecito-Regular.ttf',
  'Playwrite AU SA, cursive': 'Playwrite_AU_SA/PlaywriteAUSA-VariableFont_wght.ttf',
  'Passions Conflict, cursive': 'Passions_Conflict/PassionsConflict-Regular.ttf',
  'Mountains of Christmas, cursive': 'Mountains_of_Christmas/MountainsofChristmas-Regular.ttf',
  // You can add 'Mountains of Christmas Bold' if you want to support the bold version
};

// Routes
app.use('/api/auth', authRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('PDF Signer backend is running!');
});

// Protected route - Endpoint to receive PDF and signature data
app.post('/sign-pdf', protect, upload.single('pdf'), async (req, res) => {
  try {
    // Validate file upload
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file provided' });
    }

    const pdfBuffer = req.file.buffer;
    const { signatureText, font, x, y, page } = req.body;

    // Validate required fields
    if (!signatureText || typeof signatureText !== 'string' || signatureText.trim().length === 0) {
      return res.status(400).json({ error: 'Signature text is required' });
    }

    if (signatureText.length > 100) {
      return res.status(400).json({ error: 'Signature text must be less than 100 characters' });
    }

    // Validate coordinates
    const xCoord = Number(x);
    const yCoord = Number(y);
    const pageNum = Number(page) || 1;

    if (isNaN(xCoord) || isNaN(yCoord) || xCoord < 0 || yCoord < 0) {
      return res.status(400).json({ error: 'Invalid signature coordinates' });
    }

    if (!Number.isInteger(pageNum) || pageNum < 1) {
      return res.status(400).json({ error: 'Invalid page number' });
    }

    // Validate font
    const selectedFont = font || Object.keys(fontMap)[0];
    if (!fontMap[selectedFont]) {
      console.warn(`Font not found: ${selectedFont}, using default`);
    }

    // Load and validate PDF
    let pdfDoc;
    try {
      pdfDoc = await PDFDocument.load(pdfBuffer);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid or corrupted PDF file' });
    }

    pdfDoc.registerFontkit(fontkit);

    // Get the font file path from the map
    let fontBytes;
    try {
      if (fontMap[selectedFont]) {
        const fontPath = path.join(__dirname, 'fonts', fontMap[selectedFont]);
        if (fs.existsSync(fontPath)) {
          fontBytes = fs.readFileSync(fontPath);
        } else {
          console.warn(`Font file not found: ${fontPath}, using default`);
          fontBytes = null;
        }
    } else {
        fontBytes = null;
      }
    } catch (error) {
      console.warn('Error loading font file:', error.message);
      fontBytes = null;
    }

    // Embed font
    let fontObj;
    try {
    if (fontBytes) {
      fontObj = await pdfDoc.embedFont(fontBytes);
    } else {
        fontObj = await pdfDoc.embedFont(StandardFonts.Helvetica);
      }
    } catch (error) {
      console.warn('Error embedding font:', error.message);
      fontObj = await pdfDoc.embedFont(StandardFonts.Helvetica);
    }

    // Validate page number
    const totalPages = pdfDoc.getPageCount();
    if (pageNum > totalPages) {
      return res.status(400).json({ error: `Page number ${pageNum} exceeds total pages (${totalPages})` });
    }

    const pdfPage = pdfDoc.getPage(pageNum - 1);
    const { width, height } = pdfPage.getSize();
    const fontSize = 24;

    // Validate coordinates are within page bounds
    if (xCoord > width || yCoord > height) {
      return res.status(400).json({ error: 'Signature coordinates are outside page bounds' });
    }

    // Adjust Y: PDF origin is bottom-left, frontend sends from top
    const adjustedY = height - yCoord - fontSize;

    // Ensure signature fits on page
    if (adjustedY < 0 || xCoord < 0) {
      return res.status(400).json({ error: 'Signature position is invalid' });
    }

    pdfPage.drawText(signatureText.trim(), {
      x: xCoord,
      y: adjustedY,
      size: fontSize,
      font: fontObj,
      color: rgb(0, 0, 0),
    });

    const signedPdfBytes = await pdfDoc.save();

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=signed-${Date.now()}.pdf`,
    });
    res.send(Buffer.from(signedPdfBytes));
  } catch (error) {
    console.error('SIGN PDF ERROR:', error);
    res.status(500).json({ 
      error: 'An error occurred while signing the PDF',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Error handling middleware for multer errors
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size exceeds 10MB limit' });
    }
    return res.status(400).json({ error: error.message });
  }
  if (error.message === 'Only PDF files are allowed') {
    return res.status(400).json({ error: error.message });
  }
  next(error);
});

if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
