# ✅ Setup Checklist

Use this checklist to ensure your project is properly configured.

## 🔴 **CRITICAL - Do These First**

### 1. Remove Duplicate Folders
- [ ] Delete `middleware/` folder from root
- [ ] Delete `models/` folder from root
- [ ] Delete `fonts/` folder from root
- [ ] Delete `package.json` from root (keep `server/package.json`)
- [ ] Delete `package-lock.json` from root (if exists)
- [ ] Delete `node_modules/` from root (if exists)

### 2. Create Environment Files

**Backend (`server/.env`):**
- [ ] Create `server/.env` file
- [ ] Add `PORT=5000`
- [ ] Add `CLIENT_URL=http://localhost:3000`
- [ ] Add your MongoDB connection string to `MONGODB_URI`

**Frontend (`client/.env`):**
- [ ] Create `client/.env` file
- [ ] Add `REACT_APP_API_URL=http://localhost:5000`

### 3. Install Dependencies
- [ ] Run `cd server && npm install`
- [ ] Run `cd client && npm install`

### 4. Remove Unused Dependency
- [ ] Open `server/package.json`
- [ ] Remove `"firebase-admin": "^13.4.0",` line
- [ ] Run `cd server && npm install` again

---

## 🟡 **IMPORTANT - Do These Next**

### 5. Verify MongoDB Connection
- [ ] Ensure MongoDB is running (local or cloud)
- [ ] Test connection string in `server/.env`
- [ ] Verify connection works when starting server

### 6. Test the Application
- [ ] Start backend: `cd server && npm start`
- [ ] Start frontend: `cd client && npm start`
- [ ] Test registration
- [ ] Test login
- [ ] Test PDF upload
- [ ] Test signature placement
- [ ] Test PDF download

---

## 🟢 **OPTIONAL - Nice to Have**

### 7. Code Quality
- [ ] Review error messages
- [ ] Test edge cases (large files, invalid inputs)
- [ ] Verify all validations work

### 8. Documentation
- [ ] Review README.md
- [ ] Review PROJECT_REVIEW.md
- [ ] Review FOLDER_STRUCTURE.md

---

## 📝 **Quick Reference**

### Environment Variables Needed:

**`server/.env`:**
```env
PORT=5000
CLIENT_URL=http://localhost:3000
MONGODB_URI=your_connection_string_here
```

**`client/.env`:**
```env
REACT_APP_API_URL=http://localhost:5000
```

### Commands to Run:

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install

# Start backend (Terminal 1)
cd server
npm start

# Start frontend (Terminal 2)
cd client
npm start
```

---

## ⚠️ **Common Issues**

### Issue: "Cannot find module"
- **Solution**: Run `npm install` in the respective folder

### Issue: "MongoDB connection failed"
- **Solution**: Check your `MONGODB_URI` in `server/.env`

### Issue: "CORS error"
- **Solution**: Verify `CLIENT_URL` in `server/.env` matches frontend URL

### Issue: "API not found"
- **Solution**: Check `REACT_APP_API_URL` in `client/.env` matches backend URL

---

## ✅ **When Complete**

Once all items are checked:
1. Your project structure is clean
2. All dependencies are installed
3. Environment variables are configured
4. Application is ready to run

**Next Steps:**
- Start developing new features
- Deploy to production
- Add tests
- Improve documentation



