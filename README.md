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
- **TinyMCE** untuk rich text editor

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
- TinyMCE API Key (gratis)
- Nginx (untuk production deployment)
- PM2 (untuk process management)

## 🚀 Setup Lengkap Step by Step

### 1. Clone Repository

```bash
git clone https://github.com/sitaurs/Blogger-Dashboard
cd blogger-dashboard
```

### 2. Setup Google Cloud Console

#### 2.1 Buat Project Baru
1. Kunjungi [Google Cloud Console](https://console.cloud.google.com/)
2. Klik "Select a project" → "New Project"
3. Beri nama project (contoh: "Blogger Dashboard")
4. Klik "Create"

#### 2.2 Aktifkan Blogger API
1. Di Google Cloud Console, buka "APIs & Services" → "Library"
2. Cari "Blogger API v3"
3. Klik dan pilih "Enable"

#### 2.3 Konfigurasi OAuth 2.0
1. Buka "APIs & Services" → "Credentials"
2. Klik "Create Credentials" → "OAuth 2.0 Client IDs"
3. Pilih "Web application"
4. Beri nama (contoh: "Blogger Dashboard Client")
5. **Authorized redirect URIs**: Tambahkan `http://localhost:3002/api/admin/oauth/callback`
6. Klik "Create"
7. **SIMPAN** Client ID dan Client Secret yang muncul

#### 2.4 Setup OAuth Consent Screen
1. Buka "APIs & Services" → "OAuth consent screen"
2. Pilih "External" → "Create"
3. Isi informasi aplikasi:
   - App name: "Blogger Dashboard"
   - User support email: email Anda
   - Developer contact: email Anda
4. Klik "Save and Continue"
5. **Scopes**: Tambahkan scope `https://www.googleapis.com/auth/blogger`
6. **PENTING**: Ubah status dari "Testing" ke "In production" untuk mendapatkan refresh token yang berumur panjang

### 3. Setup TinyMCE API Key

#### 3.1 Daftar TinyMCE
1. Kunjungi [TinyMCE](https://www.tiny.cloud/)
2. Klik "Get API Key" → "Sign Up"
3. Daftar dengan email Anda (gratis)

#### 3.2 Dapatkan API Key
1. Login ke TinyMCE Dashboard
2. Buka "My Account" → "Dashboard"
3. **Copy API Key** yang tersedia
4. **Approved Domains**: Tambahkan domain Anda (contoh: `localhost`, `yourdomain.com`)

### 4. Setup MongoDB

#### 4.1 Install MongoDB (Ubuntu/Debian)
```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Create list file for MongoDB
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update package database
sudo apt update

# Install MongoDB
sudo apt install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify installation
sudo systemctl status mongod
```

#### 4.2 MongoDB Cloud (Alternative)
Jika ingin menggunakan MongoDB Atlas (cloud):
1. Kunjungi [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Daftar dan buat cluster gratis
3. Dapatkan connection string
4. Gunakan connection string di `.env`

### 5. Install Dependencies

#### 5.1 Frontend Dependencies
```bash
npm install
```

#### 5.2 Backend Dependencies
```bash
cd backend
npm install
cd ..
```

### 6. Konfigurasi Environment Variables

#### 6.1 Frontend Environment (.env)
Buat file `.env` di root project:
```bash
cp .env.example .env
```

Edit `.env`:
```env
# TinyMCE Configuration
VITE_TINYMCE_API_KEY=your_actual_tinymce_api_key_here
```

**Ganti `your_actual_tinymce_api_key_here` dengan API key TinyMCE Anda**

#### 6.2 Backend Environment (backend/.env)
```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:
```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/blogger-dashboard

# Google OAuth Configuration (WAJIB)
GOOGLE_CLIENT_ID=your_google_client_id_from_step_2
GOOGLE_CLIENT_SECRET=your_google_client_secret_from_step_2
GOOGLE_REDIRECT_URI=http://localhost:3002/api/admin/oauth/callback

# JWT Configuration
JWT_SECRET=your_very_long_and_secure_jwt_secret_key_here_at_least_32_characters_long
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=3002
NODE_ENV=production

# Admin Account Configuration
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_admin_password_here
ADMIN_EMAIL=admin@yourdomain.com

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# Session Configuration
SESSION_SECRET=your_session_secret_here_make_it_long_and_secure

# File Upload Configuration
MAX_FILE_SIZE=10485760
```

**Penting**: Ganti semua nilai `your_*` dengan nilai sebenarnya:
- `GOOGLE_CLIENT_ID`: Client ID dari Google Cloud Console
- `GOOGLE_CLIENT_SECRET`: Client Secret dari Google Cloud Console
- `JWT_SECRET`: String acak minimal 32 karakter
- `ADMIN_PASSWORD`: Password admin yang kuat
- `SESSION_SECRET`: String acak untuk session security

### 7. Setup OAuth Token (One-Time)

Jalankan script untuk setup OAuth:
```bash
npm run generate-token
```

**Ikuti instruksi script:**
1. Script akan menampilkan URL authorization Google
2. **Copy URL** dan buka di browser
3. **Login** ke akun Google yang memiliki blog
4. **Authorize** aplikasi
5. Setelah redirect, **copy authorization code** dari URL
6. **Paste code** ke terminal
7. Script akan otomatis menyimpan refresh token ke MongoDB

### 8. Build Frontend

```bash
npm run build
```

### 9. Setup PM2 untuk Backend

#### 9.1 Install PM2 Global
```bash
sudo npm install -g pm2
```

#### 9.2 Start Backend dengan PM2
```bash
cd backend
pm2 start server.js --name "blogger-dashboard-backend"
pm2 save
pm2 startup
```

#### 9.3 Verifikasi PM2
```bash
pm2 status
pm2 logs blogger-dashboard-backend
```

### 10. Setup Nginx

#### 10.1 Install Nginx
```bash
sudo apt update
sudo apt install nginx
```

#### 10.2 Konfigurasi Nginx
Buat file konfigurasi:
```bash
sudo nano /etc/nginx/sites-available/blogger-dashboard
```

Isi dengan konfigurasi berikut:
```nginx
server {
    listen 80;
    server_name your-domain.com;  # Ganti dengan domain Anda
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;

    # Frontend (React build)
    location / {
        root /path/to/blogger-dashboard/dist;  # Ganti dengan path absolut
        index index.html;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Uploaded files
    location /uploads {
        proxy_pass http://localhost:3002;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Cache uploaded files
        expires 1y;
        add_header Cache-Control "public";
    }

    # Security: Block access to sensitive files
    location ~ /\. {
        deny all;
    }
    
    location ~ \.(env|log)$ {
        deny all;
    }
}
```

#### 10.3 Aktifkan Konfigurasi
```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/blogger-dashboard /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### 11. Cara Mendapatkan Blog ID

#### 11.1 Metode Otomatis (Recommended)
1. Setelah OAuth setup selesai, jalankan aplikasi
2. Login ke dashboard
3. Aplikasi akan otomatis mendeteksi semua blog Anda
4. Blog ID akan ditampilkan di halaman Settings

#### 11.2 Metode Manual
1. Buka blog Anda di browser
2. View source code (Ctrl+U)
3. Cari "blogId" atau "data-blog-id"
4. Copy angka panjang tersebut (contoh: 1234567890123456789)

### 12. Akses Aplikasi

- **URL**: `http://your-domain.com` atau `http://localhost` (jika local)
- **Login Default**: 
  - Username: `admin`
  - Password: sesuai yang Anda set di `backend/.env`

## 🔧 Management Commands

### PM2 Commands
```bash
# Status aplikasi
pm2 status

# Restart aplikasi
pm2 restart blogger-dashboard-backend

# Stop aplikasi
pm2 stop blogger-dashboard-backend

# Logs aplikasi
pm2 logs blogger-dashboard-backend

# Monitor aplikasi
pm2 monit
```

### Nginx Commands
```bash
# Test konfigurasi
sudo nginx -t

# Reload konfigurasi
sudo nginx -s reload

# Restart Nginx
sudo systemctl restart nginx

# Status Nginx
sudo systemctl status nginx
```

### MongoDB Commands
```bash
# Status MongoDB
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod

# Stop MongoDB
sudo systemctl stop mongod

# MongoDB logs
sudo journalctl -u mongod
```

## 🔍 Troubleshooting

### OAuth Issues
- Pastikan Google Cloud Console dikonfigurasi dengan benar
- Periksa redirect URI sesuai dengan konfigurasi
- Jalankan `npm run generate-token` untuk setup ulang
- Pastikan aplikasi dalam status "In production" di OAuth consent screen

### TinyMCE Issues
- Pastikan API key benar di `.env`
- Periksa domain sudah terdaftar di TinyMCE dashboard
- Cek browser console untuk error messages

### Database Issues
- Periksa MongoDB service: `sudo systemctl status mongod`
- Periksa connection string di `backend/.env`
- Pastikan database dapat diakses

### API Errors
- Periksa quota Blogger API di Google Cloud Console
- Pastikan token tidak expired
- Check logs: `pm2 logs blogger-dashboard-backend`

### Nginx Issues
- Test konfigurasi: `sudo nginx -t`
- Periksa path ke build folder sudah benar
- Pastikan PM2 backend berjalan di port 3002

## 📊 Monitoring

### PM2 Monitoring
```bash
# Real-time monitoring
pm2 monit

# Memory usage
pm2 show blogger-dashboard-backend
```

### Nginx Logs
```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log
```

### Application Logs
```bash
# Backend logs
pm2 logs blogger-dashboard-backend --lines 100

# Follow logs
pm2 logs blogger-dashboard-backend -f
```

## 🔒 Keamanan

- **OAuth 2.0**: Secure Google API access
- **JWT Authentication**: Secure admin sessions
- **Rate Limiting**: Protection against abuse
- **Input Validation**: All inputs validated
- **Security Headers**: Helmet.js protection
- **Environment Variables**: Sensitive data protection
- **Nginx Security**: Additional security headers

## 🚢 Production Deployment

### SSL Certificate (Recommended)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Firewall Setup
```bash
# Enable UFW
sudo ufw enable

# Allow SSH
sudo ufw allow ssh

# Allow HTTP/HTTPS
sudo ufw allow 'Nginx Full'

# Check status
sudo ufw status
```

### Backup Strategy
```bash
# MongoDB backup
mongodump --db blogger-dashboard --out /backup/mongodb/

# Application backup
tar -czf /backup/app-$(date +%Y%m%d).tar.gz /path/to/blogger-dashboard/
```

## 📝 Perbedaan dari Mode Demo

### ❌ Yang Dihapus:
- Semua data mock dan array statis
- Logika demo dan fallback
- Variabel `isDemo` dan `APP_MODE=demo`
- Mock functions dan dummy data
- Ecosystem config (diganti manual PM2)

### ✅ Yang Ditambahkan:
- Full OAuth 2.0 implementation
- Real Blogger API integration
- MongoDB data persistence
- Production error handling
- Token management system
- File upload functionality
- TinyMCE rich text editor
- Manual PM2 process management
- Nginx configuration

## 🎯 Fitur yang Sekarang Berfungsi Penuh

1. **Dashboard**: Menampilkan statistik real dari blog Anda
2. **Posts Management**: CRUD penuh dengan Blogger API
3. **Pages Management**: Kelola halaman statis
4. **Comments Moderation**: Moderasi komentar real
5. **Content Library**: Upload dan kelola file media
6. **Settings**: OAuth status dan konfigurasi
7. **Statistics**: Analisis berdasarkan data real
8. **Rich Text Editor**: Editor lengkap dengan TinyMCE

## 📞 Support

Jika mengalami masalah:
1. Periksa konfigurasi Google Cloud Console
2. Pastikan MongoDB berjalan
3. Periksa file `.env` (frontend dan backend)
4. Jalankan OAuth setup ulang jika perlu
5. Check browser console dan server logs
6. Pastikan TinyMCE API key valid
7. Verifikasi Nginx konfigurasi

---

**Blogger Dashboard** - Sekarang dalam mode produksi penuh dengan deployment yang proper! 🚀

### Quick Production Setup Summary

```bash
# 1. Setup Google Cloud Console & TinyMCE & MongoDB
# 2. Clone & Install
git clone <repo> && cd blogger-dashboard
npm install && cd backend && npm install && cd ..

# 3. Configure environment files
cp .env.example .env
cp backend/.env.example backend/.env
# Edit both .env files with your actual values

# 4. Setup OAuth & Build
npm run generate-token
npm run build

# 5. Deploy with PM2 & Nginx
cd backend && pm2 start server.js --name "blogger-dashboard-backend"
sudo nginx -t && sudo systemctl restart nginx

# Access: http://your-domain.com
# Login: admin / [your-password]
```

**Ready for production deployment! 🎮**