// ============================================================
// STATE
// ============================================================

let currentEmail = '';
let countdownInterval = null;

// ============================================================
// DOM REFERENCES
// ============================================================

const stepRegister = document.getElementById('step-register');
const stepOtp = document.getElementById('step-otp');
const stepSuccess = document.getElementById('step-success');

const registerForm = document.getElementById('register-form');
const otpForm = document.getElementById('otp-form');
const btnRegister = document.getElementById('btn-register');
const btnVerify = document.getElementById('btn-verify');
const btnResend = document.getElementById('btn-resend');
const btnBack = document.getElementById('btn-back');
const btnNewRegister = document.getElementById('btn-new-register');

const otpInputs = document.querySelectorAll('.otp-digit');
const otpEmailDisplay = document.getElementById('otp-email-display');
const countdownEl = document.getElementById('countdown');
const resendText = document.getElementById('resend-text');
const successInfo = document.getElementById('success-info');

// ============================================================
// TOAST NOTIFICATIONS
// ============================================================

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = {
        success: '✅',
        error: '❌',
        info: 'ℹ️',
    };

    toast.innerHTML = `<span>${icons[type] || ''}</span><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('fadeOut');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// ============================================================
// STEP NAVIGATION
// ============================================================

function showStep(step) {
    [stepRegister, stepOtp, stepSuccess].forEach(s => s.classList.remove('active'));
    step.classList.add('active');
}

// ============================================================
// LOADING STATE
// ============================================================

function setLoading(button, loading) {
    if (loading) {
        button.classList.add('loading');
        button.disabled = true;
    } else {
        button.classList.remove('loading');
        button.disabled = false;
    }
}

// ============================================================
// COUNTDOWN TIMER
// ============================================================

function startCountdown() {
    let seconds = 60;
    btnResend.disabled = true;
    resendText.style.display = 'block';
    countdownEl.textContent = seconds;

    clearInterval(countdownInterval);
    countdownInterval = setInterval(() => {
        seconds--;
        countdownEl.textContent = seconds;

        if (seconds <= 0) {
            clearInterval(countdownInterval);
            btnResend.disabled = false;
            resendText.style.display = 'none';
        }
    }, 1000);
}

// ============================================================
// OTP INPUT HANDLERS
// ============================================================

otpInputs.forEach((input, index) => {
    // Auto-focus next input on type
    input.addEventListener('input', (e) => {
        const value = e.target.value;

        // Filter non-numeric
        e.target.value = value.replace(/[^0-9]/g, '');

        if (e.target.value && index < otpInputs.length - 1) {
            otpInputs[index + 1].focus();
        }

        // Toggle filled class
        if (e.target.value) {
            input.classList.add('filled');
        } else {
            input.classList.remove('filled');
        }
    });

    // Handle backspace
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !e.target.value && index > 0) {
            otpInputs[index - 1].focus();
            otpInputs[index - 1].value = '';
            otpInputs[index - 1].classList.remove('filled');
        }
    });

    // Handle paste
    input.addEventListener('paste', (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);

        pastedData.split('').forEach((char, i) => {
            if (otpInputs[i]) {
                otpInputs[i].value = char;
                otpInputs[i].classList.add('filled');
            }
        });

        // Focus last filled or next empty
        const focusIndex = Math.min(pastedData.length, otpInputs.length - 1);
        otpInputs[focusIndex].focus();
    });
});

// ============================================================
// REGISTER FORM SUBMIT
// ============================================================

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nama = document.getElementById('nama').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    // Validasi client-side
    if (password !== confirmPassword) {
        showToast('Password dan konfirmasi password tidak cocok.', 'error');
        return;
    }

    if (password.length < 6) {
        showToast('Password minimal 6 karakter.', 'error');
        return;
    }

    setLoading(btnRegister, true);

    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nama, email, password }),
        });

        const data = await response.json();

        if (data.success) {
            currentEmail = email;
            otpEmailDisplay.textContent = email;
            showStep(stepOtp);
            startCountdown();
            otpInputs[0].focus();
            showToast(data.message, 'success');
        } else {
            showToast(data.message, 'error');
        }
    } catch (error) {
        console.error('Register error:', error);
        showToast('Gagal menghubungi server. Pastikan server berjalan.', 'error');
    } finally {
        setLoading(btnRegister, false);
    }
});

// ============================================================
// OTP FORM SUBMIT
// ============================================================

otpForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const otp = Array.from(otpInputs).map(i => i.value).join('');

    if (otp.length !== 6) {
        showToast('Masukkan 6 digit kode OTP.', 'error');
        otpInputs.forEach(i => i.classList.add('error'));
        setTimeout(() => otpInputs.forEach(i => i.classList.remove('error')), 500);
        return;
    }

    setLoading(btnVerify, true);

    try {
        const response = await fetch('/api/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: currentEmail, otp }),
        });

        const data = await response.json();

        if (data.success) {
            clearInterval(countdownInterval);

            // Show success info
            successInfo.innerHTML = `
        <p>📧 Email: <strong>${currentEmail}</strong></p>
        <p>⏰ Diverifikasi pada: <strong>${new Date().toLocaleString('id-ID')}</strong></p>
      `;

            showStep(stepSuccess);
            showToast('🎉 Akun berhasil diverifikasi!', 'success');
        } else {
            showToast(data.message, 'error');
            otpInputs.forEach(i => i.classList.add('error'));
            setTimeout(() => otpInputs.forEach(i => i.classList.remove('error')), 500);
        }
    } catch (error) {
        console.error('Verify error:', error);
        showToast('Gagal menghubungi server.', 'error');
    } finally {
        setLoading(btnVerify, false);
    }
});

// ============================================================
// RESEND OTP
// ============================================================

btnResend.addEventListener('click', async () => {
    btnResend.disabled = true;

    try {
        const response = await fetch('/api/resend-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: currentEmail }),
        });

        const data = await response.json();

        if (data.success) {
            showToast('Kode OTP baru telah dikirim!', 'success');
            // Clear OTP inputs
            otpInputs.forEach(i => {
                i.value = '';
                i.classList.remove('filled');
            });
            otpInputs[0].focus();
            startCountdown();
        } else {
            showToast(data.message, 'error');
            btnResend.disabled = false;
        }
    } catch (error) {
        console.error('Resend error:', error);
        showToast('Gagal menghubungi server.', 'error');
        btnResend.disabled = false;
    }
});

// ============================================================
// NAVIGATION BUTTONS
// ============================================================

btnBack.addEventListener('click', () => {
    clearInterval(countdownInterval);
    showStep(stepRegister);
    // Clear OTP inputs
    otpInputs.forEach(i => {
        i.value = '';
        i.classList.remove('filled');
    });
});

btnNewRegister.addEventListener('click', () => {
    registerForm.reset();
    currentEmail = '';
    showStep(stepRegister);
});
