# 🔧 TROUBLESHOOTING GUIDE - PAUD HI SISMONEV

## 🚨 **ERROR: Database Connection Failed**

### **📋 Gejala:**
- Frontend error: "Terjadi Kesalahan"
- Network tab: Semua request gagal dengan `net::ERR`
- Service Worker: Failed to fetch files
- Backend: Tidak bisa start atau crash

### **🔍 Root Cause:**
Setelah perbaikan hardcoded localhost, backend sekarang menggunakan environment variables untuk database connection. Jika environment variables tidak terbaca, backend tidak bisa start.

---

## **🛠️ SOLUSI LENGKAP:**

### **1. Pastikan MongoDB Berjalan:**
```bash
# Windows - Start MongoDB Service
net start MongoDB

# Atau manual start
mongod --dbpath "C:\data\db"
```

### **2. Pastikan Environment Variables:**
```env
# backend/.env
MONGODB_URI=mongodb://localhost:27017/paudhi
JWT_SECRET=your_super_secret_jwt_key_here
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
BASE_URL=http://localhost:5000
```

### **3. Start Backend Server:**
```bash
cd backend
npm start
```

**Expected Output:**
```
✅ MongoDB connected
📊 Database: mongodb://localhost:27017/paudhi
🚀 Server berjalan di port 5000
```

### **4. Start Frontend:**
```bash
npm run dev
```

**Expected Output:**
```
Local:   http://localhost:5173/
Network: http://192.168.x.x:5173/
```

---

## **🔍 DEBUGGING STEPS:**

### **Step 1: Check MongoDB**
```bash
# Test MongoDB connection
mongosh mongodb://localhost:27017/paudhi
```

### **Step 2: Check Backend Environment**
```bash
cd backend
node -e "require('dotenv').config(); console.log('MONGODB_URI:', process.env.MONGODB_URI)"
```

### **Step 3: Check Backend Health**
```bash
curl http://localhost:5000/api/health
```

### **Step 4: Check Frontend Environment**
```bash
node -e "console.log('VITE_API_URL:', process.env.VITE_API_URL)"
```

---

## **🚀 QUICK START:**

### **Option 1: Use Batch Script**
```bash
# Double-click start-dev.bat
# Script akan start MongoDB, Backend, dan Frontend otomatis
```

### **Option 2: Manual Start**
```bash
# Terminal 1: Start MongoDB
net start MongoDB

# Terminal 2: Start Backend
cd backend
npm start

# Terminal 3: Start Frontend
npm run dev
```

---

## **❌ COMMON ERRORS:**

### **Error 1: "MONGODB_URI is not defined"**
**Solution:** Pastikan file `backend/.env` ada dan berisi `MONGODB_URI=mongodb://localhost:27017/paudhi`

### **Error 2: "EADDRINUSE: address already in use :::5000"**
**Solution:** Kill process yang menggunakan port 5000:
```bash
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### **Error 3: "MongoDB connection error"**
**Solution:** Start MongoDB service:
```bash
net start MongoDB
```

### **Error 4: Frontend "net::ERR" errors**
**Solution:** Pastikan backend berjalan di port 5000 dan environment variables benar.

---

## **✅ VERIFICATION:**

### **Backend Working:**
- ✅ `http://localhost:5000/api/health` returns 200
- ✅ Console shows "✅ MongoDB connected"
- ✅ No error messages

### **Frontend Working:**
- ✅ `http://localhost:5173` loads without errors
- ✅ Network tab shows successful API calls
- ✅ No service worker errors

### **Database Working:**
- ✅ Backend can connect to MongoDB
- ✅ API endpoints return data
- ✅ No connection timeouts

---

## **🎯 FINAL CHECK:**

1. **MongoDB**: ✅ Running
2. **Backend**: ✅ Running on port 5000
3. **Frontend**: ✅ Running on port 5173
4. **Environment Variables**: ✅ Set correctly
5. **API Connection**: ✅ Working

**Jika semua checklist ✅, aplikasi siap digunakan!**
