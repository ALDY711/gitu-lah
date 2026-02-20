# 🔐 Sistem Registrasi dengan Verifikasi OTP Gmail

Sistem registrasi pengguna modern yang dilengkapi dengan fitur verifikasi **One-Time Password (OTP)** otomatis melalui email. Dibuat dengan backend Node.js yang stabil dan frontend premium dengan estetika *dark mode* dan *glassmorphism*.

## ✨ Fitur Utama

- **Registrasi Modern**: Form pendaftaran dengan validasi input lengkap.
- **Verifikasi OTP Otomatis**: Kode OTP 6-digit dikirim secara real-time melalui Gmail.
- **Email Plain Text Menarik**: Format email OTP yang bersih, profesional, dan responsif.
- **Dashboard Sukses**: Tampilan konfirmasi pendaftaran berhasil yang elegan.
- **Database SQLite**: Penyimpanan data yang ringan, cepat, dan tanpa perlu setup server DB terpisah.
- **Keamanan**: Password disimpan dalam bentuk hash menggunakan `bcryptjs`.
- **UI/UX Premium**: Efek glassmorphism, animasi partikel background, dan notifikasi toast (pop-up).

## 🚀 Teknologi yang Digunakan

- **Backend**: Node.js, Express.js
- **Database**: SQLite (`sqlite3`)
- **Email Service**: Nodemailer (Gmail SMTP)
- **Frontend**: Vanilla HTML5, CSS3 (Modern Hooks/Transitions), JavaScript (Fetch API)
- **Security**: Bcryptjs untuk hashing password

## 📝 Prasyarat

Sebelum menjalankan proyek ini, pastikan Anda memiliki:
1. **Node.js** terinstal di komputer Anda.
2. Akun **Gmail** yang aktif.
3. **App Password Gmail** (Sangat penting! Lihat panduan di bawah).

## 🛠️ Setup & Instalasi

### 1. Dapatkan App Password Gmail
Demi keamanan, Google tidak mengizinkan aplikasi pihak ketiga menggunakan password utama Anda. Anda **HARUS** menggunakan App Password:
1. Masuk ke [Google Account Security](https://myaccount.google.com/security).
2. Aktifkan **2-Step Verification** jika belum aktif.
3. Cari menu **App passwords**.
4. Buat password baru (Pilih "Mail" dan "Windows Computer" atau "Other").
5. Salin kode 16-digit yang muncul.

### 2. Kloning & Install Dependencies
```bash
# Install dependencies
npm install
```

### 3. Konfigurasi Environment
Buat file atau edit file `.env` di direktori utama:
```env
PORT=3001
GMAIL_USER=email_anda@gmail.com
GMAIL_APP_PASSWORD=kode_16_digit_dari_google
```

## 🏃 Cara Menjalankan

Jalankan server dengan perintah:
```bash
node server.js
```
Akses aplikasi melalui browser di: `http://localhost:3001`

## 📂 Struktur Proyek

```text
├── public/              # File frontend (Halaman Web)
│   ├── index.html       # Struktur halaman utama
│   ├── style.css        # Desain premium & animasi
│   └── script.js        # Logika interaksi frontend
├── db.js                # Konfigurasi & Inisialisasi Database
├── mailer.js            # Service pengiriman email OTP
├── server.js            # Express server & API Endpoints
├── register.db          # File database (otomatis terbuat)
├── .env                 # File konfigurasi rahasia
└── package.json         # Daftar dependencies proyek
```

## 📡 API Endpoints

| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| `POST` | `/api/register` | Mendaftarkan akun & mengirim OTP |
| `POST` | `/api/verify-otp` | Memverifikasi kode OTP user |
| `POST` | `/api/resend-otp` | Mengirim ulang kode OTP baru |
| `GET` | `/api/users` | List user (untuk kebutuhan testing) |

---
Dibuat dengan ❤️ 
