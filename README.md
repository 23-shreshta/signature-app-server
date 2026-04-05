# 📝 PDF Signature App

A full-stack web application that allows users to upload PDF documents, add typed signatures with custom fonts, and download signed PDFs.

## ✨ Features

- **User Authentication**: Secure login and registration system
- **PDF Upload**: Upload and preview PDF documents
- **Custom Signatures**: Type your signature with 10 different font styles
- **Drag & Drop**: Intuitively place your signature anywhere on the PDF
- **Download**: Download your signed PDF instantly
- **Input Validation**: Comprehensive client and server-side validation
- **Error Handling**: User-friendly error messages and notifications
- **Automated CI/CD**: Full GitHub Actions pipeline with testing, container registry integration (GHCR), and zero-downtime deployment to Render.

## 🛠️ Tech Stack

### Frontend
- React 18
- Material-UI (MUI)
- react-pdf for PDF rendering
- pdfjs-dist for PDF processing

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT authentication
- pdf-lib for PDF manipulation
- Multer for file uploads

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- npm (v6 or higher)
- MongoDB database (local or cloud)

## 🚀 Getting Started

### Step 1: Clone the Repository

```bash
git clone <your-repo-url>
cd signature-app
```

### Step 2: Install Dependencies

**Backend:**
```bash
cd server
npm install
```

**Frontend:**
```bash
cd ../client
npm install
```

### Step 3: Environment Setup

**Backend Environment Variables:**

Create a `.env` file in the `server/` folder:

```env
PORT=5000
CLIENT_URL=http://localhost:3000
MONGODB_URI=your_mongodb_connection_string_here
```

**Frontend Environment Variables:**

Create a `.env` file in the `client/` folder:

```env
REACT_APP_API_URL=http://localhost:5000
```

### Step 4: Run the Application

**Start the Backend Server:**

Open a terminal and run:
```bash
cd server
npm start
```

The server will start on `http://localhost:5000`

**Start the Frontend:**

Open another terminal and run:
```bash
cd client
npm start
```

The application will open in your browser at `http://localhost:3000`

## 📁 Project Structure

```
signature-app/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/    # React components (Login, Signup)
│   │   ├── App.js         # Main application component
│   │   └── index.js       # Entry point
│   ├── public/            # Static files
│   └── package.json       # Frontend dependencies
│
├── server/                 # Express backend application
│   ├── config/            # Configuration files
│   │   └── db.js          # Database connection
│   ├── routes/            # API routes
│   │   └── auth.js        # Authentication routes
│   ├── middleware/        # Custom middleware
│   │   └── auth.js        # JWT authentication
│   ├── models/           # Database models
│   │   └── User.js       # User model
│   ├── fonts/            # Font files for signatures
│   ├── index.js          # Server entry point
│   └── package.json      # Backend dependencies
│
└── README.md             # This file
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### PDF Signing
- `POST /sign-pdf` - Sign a PDF document (protected)

## 🎨 Available Fonts

The application includes 10 signature font styles:
1. Pacifico
2. Monsieur La Doulaise
3. Kirang Haerang
4. Indie Flower
5. Henny Penny
6. Comforter Brush
7. Barriecito
8. Playwrite AU SA
9. Passions Conflict
10. Mountains of Christmas

## 📝 Usage

1. **Register/Login**: Create an account or sign in
2. **Upload PDF**: Click "Choose PDF" to upload a document
3. **Type Signature**: Enter your name in the signature field
4. **Select Font**: Choose from available font styles
5. **Place Signature**: Drag and drop your signature preview onto the PDF
6. **Download**: Click "Download Signed PDF" to get your signed document

## ⚙️ Configuration

### File Upload Limits
- Maximum file size: 10MB
- Allowed file type: PDF only

### Signature Limits
- Maximum signature length: 100 characters
- Signature position validation: Ensures signature fits within PDF bounds

## 🐛 Troubleshooting

### Server won't start
- Check if MongoDB is running and connection string is correct
- Verify all environment variables are set
- Check if port 5000 is available

### Frontend won't connect to backend
- Verify `REACT_APP_API_URL` in client `.env` matches backend URL
- Ensure backend server is running
- Check CORS configuration in server

### PDF upload fails
- Ensure file is a valid PDF
- Check file size is under 10MB
- Verify file is not corrupted

## 📦 Build for Production

**Build Frontend:**
```bash
cd client
npm run build
```

**Start Production Server:**
```bash
cd server
NODE_ENV=production npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 🚀 Continuous Deployment (CI/CD)

The application includes a professional CI/CD pipeline using **GitHub Actions**, **GitHub Container Registry (GHCR)**, and **Render**.

### 1. Workflow Stages
Every push to the `main` branch triggers:
1.  **Test**: Runs all unit tests.
2.  **E2E**: Builds Docker containers and runs Selenium end-to-end tests.
3.  **Release**: Builds and pushes production images to GHCR.
4.  **Deploy**: Triggers a deployment on Render via webhooks.

### 2. Setup Secret for Deployment
To enable automated deployment, add these **GitHub Repository Secrets**:
-   `RENDER_SERVER_HOOK`: The Deploy Hook URL for your backend service.
-   `RENDER_CLIENT_HOOK`: The Deploy Hook URL for your frontend service.

### 3. Deploying to Render
1.  Create a new **Blueprint** on Render using the included `render.yaml`.
2.  Connect your repository.
3.  Render will automatically provision your database, server, and client services.

## 📄 License

This project is licensed under the ISC License.

## 👤 Author

Your Name

---

**Note**: Remember to never commit `.env` files to version control. Always use `.env.example` files for documentation.



