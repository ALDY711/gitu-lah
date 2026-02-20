const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

/**
 * Mengirim kode OTP ke email tujuan
 * @param {string} email - Alamat email tujuan
 * @param {string} otpCode - Kode OTP 6-digit
 * @param {string} nama - Nama pengguna
 */
async function sendOTP(email, otpCode, nama) {
    const mailOptions = {
        from: `"Registrasi OTP" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: `🔐 [${otpCode}] Kode Verifikasi OTP Anda`,
        text: `
--------------------------------------------------
      🔐 VERIFIKASI AKUN ANDA 🔐
--------------------------------------------------

Halo ${nama},

Terima kasih telah mendaftar! Untuk menyelesaikan
proses registrasi, gunakan kode OTP di bawah ini:

👉 KODE OTP ANDA: ${otpCode}

⏰ Kode ini berlaku selama 5 MENIT.
Mohon jangan bagikan kode ini kepada siapa pun.

Jika Anda tidak merasa mendaftar, silakan abaikan
email ini. Masalah keamanan? Segera hubungi kami.

--------------------------------------------------
© 2026 Registrasi OTP System
--------------------------------------------------
        `,
    };

    return transporter.sendMail(mailOptions);
}

module.exports = { sendOTP };
