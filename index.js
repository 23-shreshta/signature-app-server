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

// Connect to database
connectDB();

console.log('MONGODB_URI:', process.env.MONGODB_URI);

app.use(cors());
app.use(express.json());

// Set up Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

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
  console.log('Reached /sign-pdf route');
  try {
    const pdfBuffer = req.file.buffer;
    const { signatureText, font, x, y, page } = req.body;

    console.log('Requested font:', font);
    console.log('Font file path:', fontMap[font]);

    const pdfDoc = await PDFDocument.load(pdfBuffer);
    pdfDoc.registerFontkit(fontkit);

    // Get the font file path from the map
    let fontBytes;
    if (fontMap[font]) {
      fontBytes = fs.readFileSync(path.join(__dirname, 'fonts', fontMap[font]));
    } else {
      fontBytes = null; // fallback to built-in Helvetica
    }

    let fontObj;
    if (fontBytes) {
      fontObj = await pdfDoc.embedFont(fontBytes);
    } else {
      fontObj = await pdfDoc.embedFont(StandardFonts.Helvetica);
    }

    const pdfPage = pdfDoc.getPage(Number(page) - 1);
    const { width, height } = pdfPage.getSize();
    const fontSize = 24;
    // Adjust Y: PDF origin is bottom-left, frontend sends from top
    const adjustedY = height - Number(y) - fontSize;

    pdfPage.drawText(signatureText, {
      x: Number(x),
      y: adjustedY,
      size: fontSize,
      font: fontObj,
      color: rgb(0, 0, 0),
    });

    const signedPdfBytes = await pdfDoc.save();

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=signed.pdf',
    });
    res.send(Buffer.from(signedPdfBytes));
  } catch (error) {
    console.error('SIGN PDF ERROR:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
