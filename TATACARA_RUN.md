# 📖 Tata Cara Menjalankan Aplikasi

Ikuti langkah-langkah di bawah ini untuk menjalankan Sistem Registrasi OTP Anda:

## 1. Pastikan Kredensial Gmail Sudah Benar
Buka file [`.env`](file:///a:/register%20email/.env) dan pastikan data berikut sudah diisi dengan benar:
- **GMAIL_USER**: Alamat Gmail Anda.
- **GMAIL_APP_PASSWORD**: 16 karakter App Password (bukan password login biasa).
- **PORT**: Atur ke `3001` (karena port 3000 biasanya sudah terpakai).

## 2. Install Dependencies (Hanya sekali)
Jika Anda baru pertama kali menjalankan proyek ini, buka terminal di folder ini dan jalankan:
```bash
npm install
```

## 3. Jalankan Server
Gunakan perintah berikut di terminal:
```bash
node server.js
```
Jika muncul pesan `🚀 Server berjalan di http://localhost:3001`, berarti server sudah aktif.

## 4. Akses di Browser
Buka browser Anda (Chrome/Edge/Firefox) dan ketik alamat berikut:
👉 [**http://localhost:3001**](http://localhost:3001)

## 5. Cara Testing Registrasi
1. **Isi Form**: Masukkan Nama, Email, dan Password.
2. **Cek Email**: Buka kotak masuk Gmail Anda. Cari email dengan subjek `🔐 [KODE] Kode Verifikasi OTP Anda`.
3. **Masukkan OTP**: Masukkan 6 angka tersebut ke input kotak-kotak di halaman web.
4. **Selesai**: Jika benar, Anda akan melihat halaman "Registrasi Berhasil".

---
### 💡 Tips Masalah Umum:
- **Error "Invalid Login"**: Berarti App Password di `.env` salah atau belum dibuat.
- **Port Error**: Jika muncul `EADDRINUSE`, ganti angka `3001` di `.env` menjadi `3002` atau lainnya, lalu jalankan ulang `node server.js`.
