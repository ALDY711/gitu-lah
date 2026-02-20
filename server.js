require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const path = require('path');
const db = require('./db');
const { sendOTP } = require('./mailer');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ============================================================
// Helper: Generate 6-digit OTP
// ============================================================
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// ============================================================
// POST /api/register — Registrasi user baru + kirim OTP
// ============================================================
app.post('/api/register', async (req, res) => {
    try {
        const { nama, email, password } = req.body;

        // Validasi input
        if (!nama || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Semua field wajib diisi.',
            });
        }

        // Validasi format email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Format email tidak valid.',
            });
        }

        // Validasi password minimal 6 karakter
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password minimal 6 karakter.',
            });
        }

        // Cek apakah email sudah terdaftar dan terverifikasi
        db.get('SELECT * FROM users WHERE email = ?', [email], async (err, existingUser) => {
            if (err) {
                console.error('[DB Error]', err);
                return res.status(500).json({ success: false, message: 'Kesalahan database.' });
            }

            if (existingUser && existingUser.is_verified) {
                return res.status(409).json({
                    success: false,
                    message: 'Email sudah terdaftar. Silakan gunakan email lain.',
                });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Fungsi untuk lanjut setelah setup user
            const proceedWithOTP = () => {
                // Hapus OTP lama untuk email ini
                db.run('DELETE FROM otp_codes WHERE email = ?', [email], (err) => {
                    // Generate & simpan OTP baru (berlaku 5 menit)
                    const otpCode = generateOTP();
                    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
                    db.run('INSERT INTO otp_codes (email, otp_code, expires_at) VALUES (?, ?, ?)', [email, otpCode, expiresAt], async (err) => {
                        if (err) {
                            console.error('[OTP DB Error]', err);
                            return res.status(500).json({ success: false, message: 'Gagal menyimpan OTP.' });
                        }

                        try {
                            // Kirim OTP via email
                            await sendOTP(email, otpCode, nama);
                            console.log(`[OTP] Kode OTP terkirim ke ${email}`);

                            res.json({
                                success: true,
                                message: 'Registrasi berhasil! Kode OTP telah dikirim ke email Anda.',
                            });
                        } catch (mailError) {
                            console.error('[Mail Error]', mailError);
                            res.status(500).json({
                                success: false,
                                message: 'Registrasi berhasil, tetapi gagal mengirim email. Periksa kredensial Gmail di .env.',
                            });
                        }
                    });
                });
            };

            // Insert atau update user
            if (existingUser) {
                // Update user yang belum terverifikasi
                db.run('UPDATE users SET nama = ?, password = ? WHERE email = ?', [nama, hashedPassword, email], (err) => {
                    if (err) return res.status(500).json({ success: false, message: 'Gagal update user.' });
                    proceedWithOTP();
                });
            } else {
                db.run('INSERT INTO users (nama, email, password) VALUES (?, ?, ?)', [nama, email, hashedPassword], (err) => {
                    if (err) return res.status(500).json({ success: false, message: 'Gagal simpan user.' });
                    proceedWithOTP();
                });
            }
        });
    } catch (error) {
        console.error('[Register Error]', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server. Silakan coba lagi.',
        });
    }
});

// ============================================================
// POST /api/verify-otp — Verifikasi kode OTP
// ============================================================
app.post('/api/verify-otp', (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Email dan kode OTP wajib diisi.',
            });
        }

        // Cari OTP terbaru untuk email ini
        db.get('SELECT * FROM otp_codes WHERE email = ? ORDER BY created_at DESC LIMIT 1', [email], (err, otpRecord) => {
            if (err) {
                console.error('[DB Error]', err);
                return res.status(500).json({ success: false, message: 'Kesalahan database.' });
            }

            if (!otpRecord) {
                return res.status(400).json({
                    success: false,
                    message: 'Kode OTP tidak ditemukan. Silakan registrasi ulang.',
                });
            }

            // Cek apakah OTP sudah expired
            if (new Date(otpRecord.expires_at) < new Date()) {
                db.run('DELETE FROM otp_codes WHERE email = ?', [email]);
                return res.status(400).json({
                    success: false,
                    message: 'Kode OTP sudah kadaluarsa. Silakan kirim ulang.',
                });
            }

            // Cek apakah OTP cocok
            if (otpRecord.otp_code !== otp) {
                return res.status(400).json({
                    success: false,
                    message: 'Kode OTP salah. Silakan coba lagi.',
                });
            }

            // Verifikasi user
            db.run('UPDATE users SET is_verified = 1 WHERE email = ?', [email], (err) => {
                if (err) {
                    console.error('[DB Error]', err);
                    return res.status(500).json({ success: false, message: 'Gagal memverifikasi user.' });
                }

                // Hapus semua OTP untuk email ini
                db.run('DELETE FROM otp_codes WHERE email = ?', [email]);

                console.log(`[VERIFIED] User ${email} berhasil diverifikasi.`);

                res.json({
                    success: true,
                    message: 'Verifikasi berhasil! Akun Anda sekarang aktif.',
                });
            });
        });
    } catch (error) {
        console.error('[Verify Error]', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server. Silakan coba lagi.',
        });
    }
});

// ============================================================
// POST /api/resend-otp — Kirim ulang kode OTP
// ============================================================
app.post('/api/resend-otp', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email wajib diisi.',
            });
        }

        // Cek apakah user ada
        db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
            if (err) {
                console.error('[DB Error]', err);
                return res.status(500).json({ success: false, message: 'Kesalahan database.' });
            }

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Email tidak ditemukan. Silakan registrasi terlebih dahulu.',
                });
            }

            if (user.is_verified) {
                return res.status(400).json({
                    success: false,
                    message: 'Akun sudah terverifikasi.',
                });
            }

            // Hapus OTP lama
            db.run('DELETE FROM otp_codes WHERE email = ?', [email], (err) => {
                // Generate & simpan OTP baru
                const otpCode = generateOTP();
                const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
                db.run('INSERT INTO otp_codes (email, otp_code, expires_at) VALUES (?, ?, ?)', [email, otpCode, expiresAt], async (err) => {
                    if (err) {
                        console.error('[OTP DB Error]', err);
                        return res.status(500).json({ success: false, message: 'Gagal menyimpan OTP.' });
                    }

                    try {
                        // Kirim OTP via email
                        await sendOTP(email, otpCode, user.nama);
                        console.log(`[RESEND OTP] Kode OTP baru terkirim ke ${email}`);

                        res.json({
                            success: true,
                            message: 'Kode OTP baru telah dikirim ke email Anda.',
                        });
                    } catch (mailError) {
                        console.error('[Mail Error]', mailError);
                        res.status(500).json({
                            success: false,
                            message: 'Gagal mengirim email. Periksa kredensial Gmail di .env.',
                        });
                    }
                });
            });
        });
    } catch (error) {
        console.error('[Resend Error]', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server. Silakan coba lagi.',
        });
    }
});

// ============================================================
// GET /api/users — Lihat semua user (untuk testing)
// ============================================================
app.get('/api/users', (req, res) => {
    db.all('SELECT id, nama, email, is_verified, created_at FROM users', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
        res.json({ success: true, users: rows });
    });
});

// ============================================================
// Start Server
// ============================================================
app.listen(PORT, () => {
    console.log(`\n🚀 Server berjalan di http://localhost:${PORT}`);
    console.log(`📧 Gmail: ${process.env.GMAIL_USER || '(belum dikonfigurasi)'}`);
    console.log(`📁 Database: register.db\n`);
});
