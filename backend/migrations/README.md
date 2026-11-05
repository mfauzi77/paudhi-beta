# 🚀 Panduan Migrasi News ke PostgreSQL

## ✅ Yang Sudah Dikerjakan

1. **Environment Configuration Fixed**
   - ✅ Frontend `.env` → `http://localhost:5000`
   - ✅ Backend `.env` → MongoDB local `paudhi_dev` + PostgreSQL `paudhi_local`
   - ✅ `dbPostgres.js` menggunakan environment variables

2. **Files Created**
   - ✅ `backend/migrations/news_schema.sql` - Schema PostgreSQL untuk News
   - ✅ `backend/migrations/migrateNews.js` - Script migrasi data

## 📋 Langkah Selanjutnya (MANUAL)

### **Langkah 1: Setup PostgreSQL Database**

Buka terminal/cmd dan masuk ke PostgreSQL:

```bash
# Windows (via psql)
psql -U postgres

# Atau via pgAdmin
```

Buat database baru:

```sql
CREATE DATABASE paudhi_local;
\c paudhi_local
```

### **Langkah 2: Jalankan Schema**

Jalankan file SQL:

```bash
# Via command line
psql -U postgres -d paudhi_local -f backend/migrations/news_schema.sql

# Atau copy-paste isi file news_schema.sql ke pgAdmin Query Tool
```

### **Langkah 3: Setup MongoDB Local**

Pastikan MongoDB local running:

```bash
# Check status (Windows)
net start MongoDB

# Atau via MongoDB Compass connect ke mongodb://localhost:27017
```

### **Langkah 4: Restart Backend**

1. Stop backend yang running (`Ctrl+C`)
2. Jalankan ulang:

```bash
cd backend
npm start
# atau
node server.js
```

Pastikan muncul log:
```
✅ MongoDB connected
✅ PostgreSQL connected: paudhi_local
```

### **Langkah 5: (Opsional) Migrate Data**

Jika ada data di MongoDB yang ingin dipindahkan:

```bash
cd backend
node migrations/migrateNews.js
```

## ⚠️ Catatan Penting

1. **Dual Database Mode**: Saat ini backend Anda akan konek ke:
   - MongoDB: `paudhi_dev` (untuk modul lain)
   - PostgreSQL: `paudhi_local` (untuk News)

2. **Routes**: Anda punya 2 route News:
   - `routes/news.js` → MongoDB (original)
   - `routes/news.pg.js` → PostgreSQL (new)

3. **Berikutnya**: Perlu update `server.js` untuk switching antara MongoDB atau PostgreSQL route.

## 🔧 Troubleshooting

**PostgreSQL tidak konek?**
- Pastikan PostgreSQL service running
- Cek password di `.env` sesuai dengan PostgreSQL Anda

**MongoDB tidak konek?**
- Install MongoDB dulu: https://www.mongodb.com/try/download/community
- Atau gunakan Docker: `docker run -d -p 27017:27017 mongo`
