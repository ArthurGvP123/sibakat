# SiBakat.id — Sistem Identifikasi Bakat Olahraga

<p align="center">
  <img src="./src/assets/Logo%20Sibakat%20(White).png" alt="Logo SiBakat White" width="300" />
</p>

**SiBakat** adalah aplikasi web modern berbasis *Sport Search* yang dirancang untuk membantu guru olahraga, pelatih, dan praktisi dalam mengidentifikasi potensi bakat olahraga anak usia dini (11-15 tahun) secara ilmiah, terukur, dan akurat.

Aplikasi ini dikembangkan sebagai bagian dari penelitian di **Universitas Negeri Semarang (UNNES)**.

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-039BE5?style=for-the-badge&logo=Firebase&logoColor=white)

---

## 🌟 Fitur Utama

SiBakat hadir dengan berbagai fitur untuk memudahkan manajemen data dan analisis:

### 1. 📊 Analisis Bakat Otomatis
* **Kalkulasi Cerdas:** Mengubah hasil tes fisik (seperti lari 40m, lempar bola basket, dll) menjadi skor (skala 1-5) berdasarkan norma baku sesuai usia dan gender.
* **Rekomendasi Cabang Olahraga:** Memberikan rekomendasi cabang olahraga potensial berdasarkan profil fisik anak.
* **Visualisasi Radar Chart:** Menampilkan kekuatan dan kelemahan atlet dalam bentuk grafik radar yang mudah dipahami.

### 2. 🗂️ Manajemen Data Terpusat
* **Database Cloud:** Menyimpan data anak dan sekolah secara aman menggunakan Google Firebase.
* **CRUD Lengkap:** Tambah, Edit, dan Hapus data anak maupun data sekolah dengan mudah.
* **Ekspor Excel:** Unduh laporan lengkap beserta analisis skor dan rekomendasi ke dalam format `.xlsx` untuk kebutuhan administrasi.

### 3. 🆚 Komparasi Statistik
* Fitur **Head-to-Head** untuk membandingkan potensi dua anak secara berdampingan.
* Perbandingan grafik radar untuk melihat perbedaan atribut fisik secara visual.

### 4. 📚 Edukasi & Panduan
* **Panduan Sport Search:** Instruksi lengkap pelaksanaan tes fisik beserta ilustrasi gambar.
* **Norma Penilaian:** Tabel referensi standar penilaian untuk anak usia 11-15 tahun.
* **Petunjuk Penggunaan:** Panduan langkah demi langkah menggunakan aplikasi.

---

## 🛠️ Teknologi yang Digunakan

* **Frontend:** [React](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/)
* **Build Tool:** [Vite](https://vitejs.dev/)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **Database & Auth:** [Firebase Firestore & Authentication](https://firebase.google.com/)
* **Charts:** [Recharts](https://recharts.org/)
* **Icons:** [Lucide React](https://lucide.dev/)
* **Deployment:** Firebase Hosting

---

## 🚀 Instalasi & Menjalankan Lokal

Ikuti langkah-langkah berikut untuk menjalankan proyek ini di komputer Anda:

### Prasyarat
* Node.js (versi 16 atau lebih baru)
* npm atau yarn

### Langkah-langkah

1.  **Clone Repositori**
    ```bash
    git clone [https://github.com/username-anda/sibakat.git](https://github.com/username-anda/sibakat.git)
    cd sibakat
    ```

2.  **Instal Dependensi**
    ```bash
    npm install
    ```

3.  **Konfigurasi Firebase**
    * Buat proyek baru di [Firebase Console](https://console.firebase.google.com/).
    * Aktifkan **Authentication** (Email/Password).
    * Aktifkan **Firestore Database**.
    * Salin konfigurasi Firebase Anda dan perbarui file `src/firebase.ts`:
        ```typescript
        // src/firebase.ts
        const firebaseConfig = {
          apiKey: "API_KEY_ANDA",
          authDomain: "PROJECT_ID.firebaseapp.com",
          projectId: "PROJECT_ID",
          storageBucket: "PROJECT_ID.appspot.com",
          messagingSenderId: "SENDER_ID",
          appId: "APP_ID"
        };
        ```

4.  **Jalankan Server Development**
    ```bash
    npm run dev
    ```
    Buka `http://localhost:5173` di browser Anda.

---

## 📂 Struktur Proyek

```text
src/
├── assets/          # Gambar, logo, dan file statis
├── components/      # Komponen UI (Navbar, Sidebar, Tables, Cards)
├── contexts/        # React Context (AuthContext)
├── lib/             # Logika bisnis & kalkulasi (norma.ts)
├── pages/           # Halaman utama aplikasi
│   ├── LandingPage.tsx        # Halaman depan (Publik)
│   ├── Home.tsx               # Dashboard (Protected)
│   ├── DataAnak.tsx           # Tabel Data
│   ├── TambahData.tsx         # Form Input/Edit
│   ├── StatistikAnak.tsx      # Detail & Analisis
│   ├── KomparasiStatistik.tsx # Perbandingan
│   └── ... (Halaman panduan lainnya)
├── App.tsx          # Routing utama
└── main.tsx         # Entry point