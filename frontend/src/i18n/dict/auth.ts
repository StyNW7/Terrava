import type { Dictionary } from "@/i18n/types";

/** Login, register, password recovery, onboarding, and form validation. */
export const auth: Dictionary = {
  // --- Brand panel ---------------------------------------------------------
  "auth.panelFooter": {
    id: "Dirancang untuk peternak, koperasi, dokter hewan, dan pengelola peternakan modern.",
    en: "Built for farmers, cooperatives, veterinarians, and modern farm managers.",
  },
  "auth.card.healthScore": { id: "Skor Kesehatan", en: "Health Score" },
  "auth.card.temperature": { id: "Suhu", en: "Temperature" },
  "auth.card.deviceStatus": { id: "Status Perangkat", en: "Device Status" },
  "auth.card.activeAlerts": { id: "Alert Aktif", en: "Active Alerts" },
  "auth.cardValue.connected": { id: "128 Terhubung", en: "128 Connected" },
  "auth.cardValue.needAttention": { id: "2 Perlu Perhatian", en: "2 Need Attention" },
  "auth.cardMeta.healthScore": { id: "Stabil", en: "Stable" },
  "auth.cardMeta.temperature": { id: "Rentang normal", en: "Normal range" },
  "auth.cardMeta.deviceStatus": { id: "Uptime 99,2%", en: "99.2% uptime" },
  "auth.cardMeta.activeAlerts": { id: "1 kritis", en: "1 critical" },

  // --- Shared fields -------------------------------------------------------
  "auth.field.fullName": { id: "Nama Lengkap", en: "Full Name" },
  "auth.field.email": { id: "Email", en: "Email" },
  "auth.field.phone": { id: "Nomor Telepon", en: "Phone Number" },
  "auth.field.password": { id: "Password", en: "Password" },
  "auth.field.confirmPassword": { id: "Konfirmasi Password", en: "Confirm Password" },
  "auth.field.newPassword": { id: "Password Baru", en: "New Password" },
  "auth.field.confirmNewPassword": { id: "Konfirmasi Password Baru", en: "Confirm New Password" },
  "auth.field.farmName": { id: "Nama Peternakan atau Organisasi", en: "Farm or Organization Name" },
  "auth.field.accountRole": { id: "Peran Akun", en: "Account Role" },
  "auth.field.farmType": { id: "Jenis Peternakan", en: "Farm Type" },
  "auth.field.city": { id: "Kota atau Kabupaten", en: "City or Regency" },
  "auth.field.province": { id: "Provinsi", en: "Province" },
  "auth.field.livestockCount": { id: "Jumlah Ternak", en: "Number of Livestock" },
  "auth.field.primaryLivestock": { id: "Ternak Utama", en: "Primary Livestock" },
  "auth.field.notificationMethod": { id: "Metode Notifikasi Pilihan", en: "Preferred Notification Method" },

  "auth.placeholder.fullName": { id: "Nama lengkap", en: "Your full name" },
  "auth.placeholder.email": { id: "nama@perusahaan.com", en: "name@company.com" },
  "auth.placeholder.password": { id: "Masukkan password", en: "Enter your password" },
  "auth.placeholder.newPassword": { id: "Buat password", en: "Create a password" },
  "auth.placeholder.newPasswordEnter": { id: "Masukkan password baru", en: "Enter a new password" },
  "auth.placeholder.confirmPassword": { id: "Ulangi password", en: "Repeat your password" },
  "auth.placeholder.confirmNewPassword": { id: "Ulangi password baru", en: "Repeat the new password" },
  "auth.placeholder.farmName": { id: "Nama peternakan atau organisasi", en: "Farm or organization name" },
  "auth.placeholder.city": { id: "Kota atau kabupaten", en: "City or regency" },
  "auth.placeholder.province": { id: "Provinsi", en: "Province" },
  "auth.placeholder.selectCount": { id: "Pilih jumlah", en: "Select a range" },
  "auth.placeholder.selectLivestock": { id: "Pilih jenis ternak", en: "Select a livestock type" },

  // --- Shared actions ------------------------------------------------------
  "auth.continue": { id: "Lanjutkan", en: "Continue" },
  "auth.processing": { id: "Memproses...", en: "Processing..." },
  "auth.createAccount": { id: "Buat Akun", en: "Create Account" },
  "auth.showPassword": { id: "Tampilkan password", en: "Show password" },
  "auth.hidePassword": { id: "Sembunyikan password", en: "Hide password" },
  "auth.capsLock": { id: "Caps Lock aktif", en: "Caps Lock is on" },
  "auth.loggedOut": { id: "Anda telah keluar dari Terrava.", en: "You have signed out of Terrava." },
  "auth.defaultRole": { id: "Peternak", en: "Farmer" },
  "auth.welcomeBack": { id: "Selamat datang kembali, {name}!", en: "Welcome back, {name}!" },
  "auth.error.invalidCredentials": {
    id: "Email atau password tidak sesuai. Silakan coba kembali.",
    en: "That email and password do not match. Please try again.",
  },
  "auth.error.generic": {
    id: "Terjadi kesalahan. Silakan coba kembali.",
    en: "Something went wrong. Please try again.",
  },

  // --- Password strength ---------------------------------------------------
  "auth.passwordStrength": { id: "Kekuatan password:", en: "Password strength:" },
  "auth.strength.veryWeak": { id: "Sangat Lemah", en: "Very Weak" },
  "auth.strength.weak": { id: "Lemah", en: "Weak" },
  "auth.strength.medium": { id: "Sedang", en: "Medium" },
  "auth.strength.strong": { id: "Kuat", en: "Strong" },
  "auth.rule.length": { id: "8+ karakter", en: "8+ characters" },
  "auth.rule.uppercase": { id: "Huruf besar", en: "Uppercase" },
  "auth.rule.lowercase": { id: "Huruf kecil", en: "Lowercase" },
  "auth.rule.number": { id: "Angka", en: "Number" },
  "auth.rule.symbol": { id: "Simbol", en: "Symbol" },

  // --- Login ---------------------------------------------------------------
  "auth.login.eyebrow": { id: "Welcome Back", en: "Welcome Back" },
  "auth.login.title": { id: "Masuk ke Terrava", en: "Sign in to Terrava" },
  "auth.login.subtitle": { id: "Akses dashboard peternakan Anda.", en: "Access your farm dashboard." },
  "auth.login.footerText": { id: "Belum memiliki akun?", en: "Do not have an account yet?" },
  "auth.login.footerLink": { id: "Daftar sekarang", en: "Sign up now" },
  "auth.login.orManual": { id: "atau masuk manual", en: "or sign in manually" },
  "auth.login.rememberMe": { id: "Ingat saya", en: "Remember me" },
  "auth.login.forgotPassword": { id: "Lupa password?", en: "Forgot password?" },
  "auth.login.submit": { id: "Masuk", en: "Sign In" },
  "auth.login.verifying": { id: "Memverifikasi...", en: "Verifying..." },
  "auth.login.orContinueWith": { id: "atau lanjutkan dengan", en: "or continue with" },
  "auth.login.terms": {
    id: "Dengan masuk, Anda menyetujui Ketentuan Layanan dan Kebijakan Privasi Terrava.",
    en: "By signing in, you agree to Terrava's Terms of Service and Privacy Policy.",
  },
  "auth.social.google": { id: "Lanjutkan dengan Google", en: "Continue with Google" },
  "auth.social.microsoft": { id: "Lanjutkan dengan Microsoft", en: "Continue with Microsoft" },
  "auth.social.connecting": { id: "Menghubungkan dengan {provider}...", en: "Connecting with {provider}..." },
  "auth.social.signedIn": { id: "Masuk dengan {provider} (mode demo).", en: "Signed in with {provider} (demo mode)." },

  // --- Demo account card ---------------------------------------------------
  "auth.demo.title": { id: "Akun Demo Tersedia", en: "Demo Account Available" },
  "auth.demo.subtitle": {
    id: "Coba dashboard tanpa perlu mendaftar.",
    en: "Try the dashboard without signing up.",
  },
  "auth.demo.selectPersona": { id: "Pilih persona demo", en: "Select a demo persona" },
  "auth.demo.autofill": { id: "Isi otomatis", en: "Autofill" },
  "auth.demo.quickLogin": { id: "Masuk langsung", en: "Sign in instantly" },
  "auth.demo.filled": {
    id: "Kredensial demo terisi. Klik Masuk untuk melanjutkan.",
    en: "Demo credentials filled in. Select Sign In to continue.",
  },
  "auth.demo.copied": { id: "{label} disalin.", en: "{label} copied." },
  "auth.demo.copyAria": { id: "Salin {label}", en: "Copy {label}" },
  "auth.demo.clipboardUnavailable": {
    id: "Clipboard tidak tersedia di browser ini.",
    en: "The clipboard is not available in this browser.",
  },

  // --- Register ------------------------------------------------------------
  "auth.register.eyebrow": { id: "Get Started", en: "Get Started" },
  "auth.register.title": { id: "Buat Akun Terrava", en: "Create your Terrava account" },
  "auth.register.subtitle": {
    id: "Isi informasi berikut untuk memulai.",
    en: "Fill in the details below to get started.",
  },
  "auth.register.footerText": { id: "Sudah memiliki akun?", en: "Already have an account?" },
  "auth.register.footerLink": { id: "Masuk", en: "Sign in" },
  "auth.register.accountInfo": { id: "Informasi Akun", en: "Account Information" },
  "auth.register.farmInfo": { id: "Informasi Peternakan", en: "Farm Information" },
  "auth.register.finish": { id: "Selesaikan Pendaftaran", en: "Finish Signing Up" },
  "auth.register.productUpdates": {
    id: "Saya ingin menerima informasi produk dan pembaruan fitur Terrava.",
    en: "I would like to receive Terrava product news and feature updates.",
  },
  "auth.register.agreeTerms": {
    id: "Saya menyetujui Ketentuan Layanan dan Kebijakan Privasi Terrava.",
    en: "I agree to Terrava's Terms of Service and Privacy Policy.",
  },
  "auth.register.summary": { id: "Ringkasan Pendaftaran", en: "Registration Summary" },
  "auth.register.created": { id: "Akun Terrava berhasil dibuat.", en: "Your Terrava account has been created." },
  "auth.register.redirecting": {
    id: "Selamat datang, {name}. Mengarahkan Anda ke proses onboarding...",
    en: "Welcome, {name}. Taking you to onboarding...",
  },
  "auth.step.account": { id: "Akun", en: "Account" },
  "auth.step.farm": { id: "Peternakan", en: "Farm" },
  "auth.step.finish": { id: "Selesai", en: "Finish" },
  "auth.summary.userName": { id: "Nama Pengguna", en: "User Name" },
  "auth.summary.email": { id: "Email", en: "Email" },
  "auth.summary.farmName": { id: "Nama Peternakan", en: "Farm Name" },
  "auth.summary.role": { id: "Peran", en: "Role" },
  "auth.summary.livestockScale": { id: "Skala Ternak", en: "Livestock Scale" },

  // --- Forgot / reset password --------------------------------------------
  "auth.forgot.eyebrow": { id: "Account Recovery", en: "Account Recovery" },
  "auth.forgot.title": { id: "Lupa Password", en: "Forgot Password" },
  "auth.forgot.subtitle": {
    id: "Masukkan email Anda dan kami akan mengirimkan tautan untuk membuat password baru.",
    en: "Enter your email and we will send you a link to create a new password.",
  },
  "auth.forgot.footerText": { id: "Ingat password Anda?", en: "Remembered your password?" },
  "auth.forgot.sent": {
    id: "Tautan reset password telah dikirim jika email tersebut terdaftar.",
    en: "If that email is registered, a password reset link is on its way.",
  },
  "auth.forgot.submit": { id: "Kirim Tautan Reset", en: "Send Reset Link" },
  "auth.forgot.sending": { id: "Mengirim...", en: "Sending..." },
  "auth.reset.eyebrow": { id: "New Password", en: "New Password" },
  "auth.reset.title": { id: "Perbarui Password", en: "Update Your Password" },
  "auth.reset.subtitle": {
    id: "Buat password baru yang kuat untuk mengamankan akun Terrava Anda.",
    en: "Create a strong new password to keep your Terrava account secure.",
  },
  "auth.reset.success": { id: "Password berhasil diperbarui.", en: "Your password has been updated." },
  "auth.reset.goToLogin": { id: "Masuk ke Terrava", en: "Sign in to Terrava" },
  "auth.reset.submit": { id: "Perbarui Password", en: "Update Password" },

  // --- Validation ----------------------------------------------------------
  "validation.emailRequired": { id: "Email wajib diisi.", en: "Email is required." },
  "validation.emailFormat": {
    id: "Gunakan format email yang valid.",
    en: "Please use a valid email format.",
  },
  "validation.passwordRequired": { id: "Password wajib diisi.", en: "Password is required." },
  "validation.passwordMin": {
    id: "Password minimal terdiri dari 8 karakter.",
    en: "Password must be at least 8 characters.",
  },
  "validation.passwordUppercase": {
    id: "Password harus memiliki huruf besar.",
    en: "Password must include an uppercase letter.",
  },
  "validation.passwordLowercase": {
    id: "Password harus memiliki huruf kecil.",
    en: "Password must include a lowercase letter.",
  },
  "validation.passwordNumber": {
    id: "Password harus memiliki angka.",
    en: "Password must include a number.",
  },
  "validation.confirmPasswordRequired": {
    id: "Konfirmasi password wajib diisi.",
    en: "Password confirmation is required.",
  },
  "validation.passwordMismatch": {
    id: "Konfirmasi password tidak sama dengan password.",
    en: "The confirmation does not match your password.",
  },
  "validation.fullNameRequired": { id: "Nama lengkap wajib diisi.", en: "Full name is required." },
  "validation.phoneRequired": { id: "Nomor telepon wajib diisi.", en: "Phone number is required." },
  "validation.phoneFormat": {
    id: "Nomor telepon harus berupa angka 8-15 digit.",
    en: "Phone number must be 8-15 digits.",
  },
  "validation.farmNameRequired": {
    id: "Nama peternakan atau organisasi wajib diisi.",
    en: "Farm or organization name is required.",
  },
  "validation.accountRoleRequired": { id: "Pilih peran akun Anda.", en: "Please select your account role." },
  "validation.farmTypeRequired": { id: "Pilih jenis peternakan.", en: "Please select a farm type." },
  "validation.cityRequired": { id: "Kota atau kabupaten wajib diisi.", en: "City or regency is required." },
  "validation.provinceRequired": { id: "Provinsi wajib diisi.", en: "Province is required." },
  "validation.livestockCountRequired": { id: "Pilih jumlah ternak.", en: "Please select a herd size." },
  "validation.primaryLivestockRequired": {
    id: "Pilih jenis ternak utama.",
    en: "Please select a primary livestock type.",
  },
  "validation.notificationMethodRequired": {
    id: "Pilih metode notifikasi.",
    en: "Please select a notification method.",
  },
  "validation.agreeTermsRequired": {
    id: "Anda harus menyetujui Ketentuan Layanan dan Kebijakan Privasi.",
    en: "You must accept the Terms of Service and Privacy Policy.",
  },

  // --- Livestock form validation ------------------------------------------
  "validation.livestock.name": { id: "Nama atau kode ternak wajib diisi.", en: "Animal name or code is required." },
  "validation.livestock.animalType": { id: "Jenis ternak wajib dipilih.", en: "Livestock type is required." },
  "validation.livestock.breed": { id: "Ras ternak wajib dipilih.", en: "Breed is required." },
  "validation.livestock.gender": { id: "Pilih jenis kelamin.", en: "Please select a gender." },
  "validation.livestock.dateOfBirth": { id: "Tanggal lahir wajib diisi.", en: "Date of birth is required." },
  "validation.livestock.internalId": { id: "ID internal wajib diisi.", en: "Internal ID is required." },
  "validation.livestock.earTagId": { id: "Ear tag ID wajib diisi.", en: "Ear tag ID is required." },
  "validation.livestock.weight": { id: "Bobot wajib diisi.", en: "Weight is required." },
  "validation.livestock.farm": { id: "Farm wajib dipilih.", en: "Farm is required." },
  "validation.livestock.barn": { id: "Barn wajib dipilih.", en: "Barn is required." },
  "validation.livestock.herdGroup": { id: "Herd group wajib dipilih.", en: "Herd group is required." },
  "validation.livestock.arrivalDate": {
    id: "Tanggal kedatangan wajib diisi.",
    en: "Arrival date is required.",
  },
  "validation.livestock.acquisitionSource": {
    id: "Sumber akuisisi wajib dipilih.",
    en: "Acquisition source is required.",
  },
  "validation.livestock.initialHealthStatus": {
    id: "Status kesehatan awal wajib dipilih.",
    en: "Initial health status is required.",
  },
  "validation.livestock.vaccinationStatus": {
    id: "Status vaksinasi wajib dipilih.",
    en: "Vaccination status is required.",
  },
};
