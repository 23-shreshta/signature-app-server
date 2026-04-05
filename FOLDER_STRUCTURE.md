# Project Folder Structure Guide

## ✅ ACTIVE FOLDERS (Keep These)

### Backend - Use `server/` folder:
- **`server/index.js`** - Main server entry point
- **`server/config/`** - Database configuration
- **`server/routes/`** - API routes
- **`server/middleware/`** - Authentication middleware
- **`server/models/`** - Database models
- **`server/fonts/`** - Font files for PDF signatures
- **`server/package.json`** - Server dependencies

### Frontend - Use `client/` folder:
- **`client/src/`** - React application source code
- **`client/package.json`** - Client dependencies

---

## ❌ DUPLICATE FOLDERS (Can Be Removed)

These are duplicates at the root level and are NOT being used:

1. **`middleware/`** (root level) - Duplicate, use `server/middleware/` instead
2. **`models/`** (root level) - Duplicate, use `server/models/` instead
3. **`fonts/`** (root level) - Duplicate, use `server/fonts/` instead
4. **`package.json`** (root level) - Duplicate, use `server/package.json` instead

---

## 📝 How to Run the Project

### Backend (from `server/` folder):
```bash
cd server
npm install
npm start
```

### Frontend (from `client/` folder):
```bash
cd client
npm install
npm start
```

---

## 🔍 Why?

The `server/index.js` file uses relative paths like:
- `require('./config/db')` - Uses `server/config/`
- `require('./routes/auth')` - Uses `server/routes/`
- `require('./middleware/auth')` - Uses `server/middleware/`

So it's looking for files **inside the server folder**, not at the root level.

