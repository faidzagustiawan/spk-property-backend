# SPK Property & ML Backend

REST API untuk Sistem Pendukung Keputusan (Decision Support System) pemilihan properti menggunakan metode Hibrida. Sistem ini mengombinasikan pembobotan **AHP (Analytic Hierarchy Process)** dengan empat algoritma perankingan: **SAW, SMART, WP, dan TOPSIS**. 

Sistem ini juga dilengkapi dengan *endpoint* *Dataset Generator* untuk mem- *pivot* data relasional menjadi format tabular yang siap dikonsumsi oleh model Machine Learning (FastAPI/Scikit-learn).

## 🚀 Teknologi yang Digunakan
* **Backend:** Node.js, Express.js
* **Database:** PostgreSQL
* **Containerization:** Docker & Docker Compose
* **Dokumentasi API:** Swagger UI (OpenAPI 3.0)
* **Keamanan:** JWT (JSON Web Token) & Bcrypt

## 📋 Prasyarat Sistem
Sebelum menjalankan proyek ini, pastikan komputer/device sudah terinstall:
1. [Node.js](https://nodejs.org/) (Versi 16 atau lebih baru)
2. [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Pastikan daemon Docker sedang berjalan)
3. [Git](https://git-scm.com/)

## 🛠️ Instalasi & Cara Menjalankan

Ikuti langkah-langkah di bawah ini untuk menjalankan *server* di *device* lokal:

**1. Clone Repository**
\`\`\`bash
git clone https://github.com/username-kamu/spk-property-backend.git
cd spk-property-backend
\`\`\`

**2. Install Dependencies**
\`\`\`bash
npm install
\`\`\`

**3. Setup Environment Variables**
Buat file bernama `.env` di *root* folder proyek, lalu salin konfigurasi berikut:
\`\`\`env
PORT=5000
JWT_SECRET=rahasia_super_aman_untuk_spk_property
DB_USER=spkuser
DB_PASSWORD=spkpassword
DB_HOST=localhost
DB_PORT=5432
DB_NAME=spk_db
\`\`\`

**4. Jalankan Database (PostgreSQL via Docker)**
Jalankan perintah ini untuk menyalakan *container* database dan otomatis membuat skema tabel:
\`\`\`bash
docker-compose up -d --build
\`\`\`
*(Catatan: Docker akan membaca file `db/init.sql` dan secara otomatis membuat tabel-tabel yang dibutuhkan).*

**5. Jalankan Server Node.js**
\`\`\`bash
npm run dev
\`\`\`
Jika berhasil, terminal akan menampilkan: `Server berjalan di mode development pada port 5000`.

## 📚 Dokumentasi API (Swagger)
Proyek ini dilengkapi dengan antarmuka interaktif untuk menguji *endpoint* API.
Setelah server berjalan, buka browser dan akses:
👉 **[http://localhost:5000/api-docs](http://localhost:5000/api-docs)**

**Alur Pengujian (Workflow):**
1. Buka `/auth/register` dan `/auth/login` untuk mendapatkan Token JWT.
2. Klik tombol **Authorize** di pojok kanan atas Swagger, masukkan token.
3. Buat Case baru (`/cases`).
4. Input Kriteria (`/criteria`).
5. Input Matriks Perbandingan AHP (`/spk/ahp/comparisons`) lalu kalkulasi bobotnya (`/spk/ahp/calculate/{case_id}`).
6. Input Alternatif rumah (`/alternatives`).
7. Jalankan kalkulasi perankingan (SAW / SMART / WP / TOPSIS).
8. Generate Dataset Machine Learning (`/ml/dataset/{case_id}`).

## 👨‍💻 Author
* **Muhammad Faidz Agustiawan**