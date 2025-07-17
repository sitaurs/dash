# Blogger Dashboard - Full Production Mode

Sebuah aplikasi web full-stack yang elegan dan powerful untuk mengelola blog Blogger dengan antarmuka yang modern dan fitur yang lengkap. Aplikasi ini sekarang berjalan dalam **mode produksi penuh** dengan integrasi langsung ke Google Blogger API dan MongoDB.

## 🎯 Fitur Utama

- **Dashboard Modern**: Antarmuka dengan desain glassmorphism yang memukau
- **Rich Text Editor**: Editor super lengkap seperti Microsoft Word dengan:
  - Upload gambar drag & drop
  - Syntax highlighting untuk code
  - Table editor
  - Media embed
  - Auto-save
  - Word count
  - Custom alerts/callouts
- **Manajemen Halaman**: Kelola halaman statis dengan mudah
- **Moderasi Komentar**: Sistem moderasi komentar yang efisien
- **Analisis Statistik**: Grafik dan chart untuk menganalisis performa blog
- **Pustaka Konten**: Manajemen file media yang terintegrasi
- **OAuth 2.0 Integration**: Integrasi penuh dengan Google Blogger API
- **Responsif**: Desain yang responsif untuk semua perangkat
- **Animasi Halus**: Menggunakan Framer Motion untuk transisi yang mulus

## 🚀 Teknologi yang Digunakan

### Frontend
- **React 18+** dengan TypeScript
- **Vite** sebagai build tool
- **Tailwind CSS** untuk styling
- **Framer Motion** untuk animasi
- **React Router** untuk routing
- **TanStack Query** untuk state management
- **Recharts** untuk visualisasi data
- **Lucide React** untuk ikon

### Backend
- **Node.js** dengan Express.js
- **TypeScript** untuk type safety
- **MongoDB** dengan Mongoose ODM
- **Google APIs** untuk integrasi Blogger
- **JWT** untuk authentication
- **Multer** untuk file upload
- **Helmet** untuk security headers
- **CORS** untuk cross-origin requests

## 📋 Prasyarat

- Node.js 18 atau lebih tinggi
- npm atau yarn
- MongoDB (local atau cloud)
- Google Cloud Console project dengan Blogger API v3 enabled

## 🚀 Setup Produksi (WAJIB)

### 1. Setup Google Cloud Console

1. **Buat Project Baru**
   - Kunjungi [Google Cloud Console](https://console.cloud.google.com/)
   - Buat project baru atau pilih project yang sudah ada
   - Aktifkan Blogger API v3

2. **Konfigurasi OAuth 2.0**
   - Buka "Credentials" di Google Cloud Console
   - Buat OAuth 2.0 Client ID
   - Tambahkan redirect URI: `http://localhost:3002/api/admin/oauth/callback`
   - Download file `credentials.json`

3. **Setup Consent Screen**
   - Konfigurasi OAuth consent screen
   - Tambahkan scope yang diperlukan untuk Blogger API
   - **PENTING**: Ubah status aplikasi dari "Testing" ke "In production" agar mendapatkan refresh token yang berumur panjang

### 2. Setup MongoDB

```bash
# Install MongoDB (Ubuntu)
sudo apt update
sudo apt install mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

### 3. Konfigurasi Environment Variables

Edit file `backend/.env`:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/blogger-dashboard

# Google OAuth (WAJIB)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3002/api/admin/oauth/callback

# JWT
JWT_SECRET=your_jwt_secret_key_here_make_it_very_long_and_secure
JWT_EXPIRES_IN=7d

# Server
PORT=3002
NODE_ENV=production

# Admin Account
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password
ADMIN_EMAIL=admin@yourdomain.com
```

## 🚀 Cara Menjalankan Aplikasi

### 1. Clone Repository
```bash
git clone https://github.com/sitaurs/Blogger-Dashboard
cd blogger-dashboard
```

### 2. Install Dependencies

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
cd backend
npm install
cd ..
```

### 3. Setup OAuth Token (One-Time)

```bash
cd backend
npm run generate-token
```

Ikuti instruksi script:
- Script akan menampilkan URL authorization Google
- Buka URL di browser dan login ke akun Google Anda
- Copy authorization code dari URL callback
- Paste code ke terminal
- Script akan menyimpan refresh token ke database

### 4. Cara Mendapatkan Blog ID

**Metode Otomatis (Recommended):**
- Setelah OAuth setup selesai, jalankan aplikasi
- Login ke dashboard
- Aplikasi akan otomatis mendeteksi semua blog Anda
- Blog ID akan ditampilkan di halaman Settings

**Metode Manual:**
- Buka blog Anda di browser
- View source code (Ctrl+U)
- Cari "blogId" atau "data-blog-id"
- Copy angka panjang tersebut (contoh: 1234567890123456789)

### 4. Jalankan Aplikasi

**Opsi A: Development Mode**
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
npm run dev
```

**Opsi B: Production Mode**
```bash
# Build frontend
npm run build

# Jalankan dengan PM2
pm2 start ecosystem.config.js
```

### 5. Akses Aplikasi
- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:3002`
- **Login Default**: 
  - Username: `admin`
  - Password: `admin123` (atau sesuai .env)

## 🔧 Fitur Produksi

### ✅ Integrasi Penuh Google Blogger API
- Semua data diambil langsung dari Blogger API
- Tidak ada lagi data mock atau demo
- Real-time synchronization dengan blog Anda

### ✅ OAuth 2.0 Authentication
- Token management otomatis
- Refresh token handling
- Secure credential storage

### ✅ MongoDB Integration
- Persistent data storage
- Caching untuk performa optimal
- User management

### ✅ Production Features
- Error handling yang robust
- Rate limiting
- Security headers
- File upload functionality
- Real-time statistics

## 📊 API Endpoints

### Authentication
- `POST /api/admin/login` - Admin login
- `GET /api/admin/me` - Get current admin info
- `GET /api/admin/oauth/url` - Get OAuth authorization URL
- `GET /api/admin/oauth/callback` - Handle OAuth callback
- `GET /api/admin/oauth/status` - Check OAuth status

### Blog Management
- `GET /api/blogs` - Get all blogs from Blogger API
- `GET /api/blogs/sync` - Force sync blogs
- `GET /api/blogs/:id` - Get specific blog

### Posts (Real Blogger API)
- `GET /api/posts` - Get all posts with pagination
- `POST /api/posts` - Create new post
- `GET /api/posts/:id` - Get specific post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post

### Pages (Real Blogger API)
- `GET /api/pages` - Get all pages
- `POST /api/pages` - Create new page
- `PUT /api/pages/:id` - Update page
- `DELETE /api/pages/:id` - Delete page

### Comments (Real Blogger API)
- `GET /api/comments` - Get all comments
- `PUT /api/comments/:id` - Update comment status
- `DELETE /api/comments/:id` - Delete comment

### Statistics (Real Data)
- `GET /api/stats/overall` - Get dashboard statistics
- `GET /api/stats/:period` - Get time-based statistics

### Content Management
- `POST /api/content/upload` - Upload files
- `GET /api/content` - Get uploaded files
- `DELETE /api/content/:id` - Delete files

## 🔒 Keamanan

- **OAuth 2.0**: Secure Google API access
- **JWT Authentication**: Secure admin sessions
- **Rate Limiting**: Protection against abuse
- **Input Validation**: All inputs validated
- **Security Headers**: Helmet.js protection
- **Environment Variables**: Sensitive data protection

## 🚢 Deployment

### VPS Ubuntu Setup

1. **Install Dependencies**
   ```bash
   sudo apt update && sudo apt upgrade -y
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs mongodb
   sudo npm install -g pm2
   ```

2. **Setup Project**
   ```bash
   git clone <repository-url>
   cd blogger-dashboard
   npm install
   cd backend && npm install && cd ..
   npm run build
   ```

3. **Configure Environment**
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with production values
   ```

4. **Run with PM2**
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

## 🔍 Troubleshooting

### OAuth Issues
- Pastikan Google Cloud Console dikonfigurasi dengan benar
- Periksa redirect URI sesuai dengan konfigurasi
- Jalankan `npm run generate-token` untuk setup ulang

### Database Issues
- Periksa MongoDB service: `sudo systemctl status mongodb`
- Periksa connection string di .env

### API Errors
- Periksa quota Blogger API di Google Cloud Console
- Pastikan token tidak expired
- Check logs untuk error details

## 📝 Perbedaan dari Mode Demo

### ❌ Yang Dihapus:
- Semua data mock dan array statis
- Logika demo dan fallback
- Variabel `isDemo` dan `APP_MODE=demo`
- Mock functions dan dummy data

### ✅ Yang Ditambahkan:
- Full OAuth 2.0 implementation
- Real Blogger API integration
- MongoDB data persistence
- Production error handling
- Token management system
- File upload functionality

## 🎯 Fitur yang Sekarang Berfungsi Penuh

1. **Dashboard**: Menampilkan statistik real dari blog Anda
2. **Posts Management**: CRUD penuh dengan Blogger API
3. **Pages Management**: Kelola halaman statis
4. **Comments Moderation**: Moderasi komentar real
5. **Content Library**: Upload dan kelola file media
6. **Settings**: OAuth status dan konfigurasi
7. **Statistics**: Analisis berdasarkan data real

## 📞 Support

Jika mengalami masalah:
1. Periksa konfigurasi Google Cloud Console
2. Pastikan MongoDB berjalan
3. Periksa file .env
4. Jalankan OAuth setup ulang jika perlu
5. Check browser console dan server logs

---

**Blogger Dashboard** - Sekarang dalam mode produksi penuh! 🚀

### Quick Production Setup

```bash
# 1. Setup Google Cloud Console & MongoDB
# 2. Configure .env file
# 3. Install & Run
npm install && cd backend && npm install && cd ..
cd backend && npm run generate-token
npm run build && pm2 start ecosystem.config.js

# Access: http://localhost:5173
# Login: admin / [your-password]
```

**Ready for production deployment! 🎮**