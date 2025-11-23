# ISO-TIK

Aplikasi web untuk pengelolaan audit dan kepatuhan TIK. Admin dapat mengelola dokumen audit, checklist excel/aspek, SoA, manual, NCR, serta review dan komentar pada setiap item audit.

## Fitur Utama

- Manajemen dokumen audit: daftar dokumen, checklist, item audit, dan navigator per checklist.
- Pertanyaan Excel & Aspek: input bukti objektif, kesesuaian, serta catatan editor dengan status terisi/belum terisi.
- Review audit: reviewer memberi komentar, menandai status “sudah direview”, dan melihat riwayat komentar.
- Modul SoA & Manual: pengelolaan kategori, dokumen, serta pertanyaan SoA.
- NCR: pencatatan kasus, tindak lanjut, dan status.
- Manajemen pengguna: daftar, edit, dan pengaturan pengguna.

## Teknologi

- React + Vite
- Tailwind utility classes dan komponen UI kustom (Button, Dialog, Input, Select, Textarea)
- Pustaka ikon: lucide-react

## Pengembangan Lokal (tanpa Docker)

1. `npm install`
2. Salin `.env.example` menjadi `.env` lalu set `VITE_API_BASE_URL` ke alamat backend (default `http://localhost:8000`).
3. `npm run dev`
4. Buka URL yang ditampilkan (default Vite dev server).
Prasyarat: Node.js 18+ dan npm.

1. Instal dependensi: `npm install`
2. Jalankan server dev: `npm run dev`
3. Buka URL yang ditampilkan (default `http://localhost:5173`)
4. Build produksi lokal: `npm run build`

## Menjalankan dengan Docker

Prasyarat umum:

- Docker Engine dan Docker Compose v2 (Linux, macOS, atau Windows/Mac dengan Docker Desktop)
- Port 5173 (mode builder/dev) dan 80 (mode produksi) tersedia

### Mode Builder / Development

Mode ini menggunakan stage `development` pada Dockerfile. Container menjalankan Vite dev server dengan hot reload dan memetakan source code melalui volume.

1. Masuk ke direktori frontend: `cd iso-tik-frontend`
2. Bangun dan jalankan: `docker compose up --build react-dev`
3. Akses aplikasi di `http://localhost:5173`
4. Hentikan dengan `Ctrl+C` atau `docker compose down`

Catatan:

- Source code dimount ke container sehingga perubahan file langsung ter-reflect.
- Jika port 5173 sudah terpakai, ganti mapping di `docker-compose.yml`.

### Mode Production

Mode ini menggunakan stage `production` pada Dockerfile (Nginx yang menyajikan hasil build Vite).

1. `cd iso-tik-frontend`
2. Jalankan: `docker compose up --build react-app`
3. Setelah container siap, akses `http://localhost`
4. Untuk background mode: `docker compose up -d react-app`
5. Hentikan dengan `docker compose down` atau `docker compose stop react-app`

Tips:

- Gunakan `docker compose build react-app` untuk rebuild image tanpa menjalankan container.
- Sesuaikan mapping port `80:80` bila ingin host port lain.

## Skrip Penting

- `npm run dev` – menjalankan Vite dev server.
- `npm run build` – membangun aset produksi ke folder `dist`.

Dokumentasi ini berlaku lintas platform selama Docker/Node tersedia; langkah spesifik OS (instalasi Docker, izin user, dsb.) mengikuti panduan resmi masing-masing platform.
