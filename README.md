# Portfolio Apps

Portfolio pribadi dengan frontend React/Vite dan backend Express untuk CMS admin, pesan kontak, media, serta CV yang bisa memiliki beberapa profil.

## Menjalankan aplikasi

```bash
npm install
npm run dev
```

Frontend berjalan di `http://localhost:5174` (Vite akan memilih port berikutnya jika sedang digunakan). Untuk menjalankan API secara lokal di terminal lain:

```bash
npm run server
```

API berjalan di port `3001`. Mode produksi dapat dijalankan dengan `npm run start` setelah `npm run build`.

## Deployment gratis Cloudflare + Firebase

Aplikasi produksi berjalan sebagai satu Cloudflare Worker dengan Static Assets dan Firestore project `portfolio-backend-fe034`. URL saat ini adalah `https://portfolio-apps.abdillah-portfolio.workers.dev`.

Firestore menyimpan data portfolio, profil CV, pesan, settings, analytics, dan sesi admin. Tiga media yang sudah ada dibundel sebagai `public/uploads` agar tetap gratis. Pada mode `MEDIA_STORAGE_DRIVER=assets`, upload/delete media dari CMS dinonaktifkan; tambahkan file ke `public/uploads` lalu deploy ulang untuk memperbaruinya. Firebase Storage dan Cloudflare R2 memerlukan billing aktif, sehingga tidak digunakan pada konfigurasi gratis ini.

Perintah utama:

```bash
npm run firebase:check       # validasi data lokal
npm run firebase:provision   # siapkan Firestore + service account
npm run firebase:migrate:free # migrasi data dengan media Static Assets
npm run cloud:check           # build + dry-run Worker
npm run cloud:deploy          # publish Worker
npm run cloud:verify          # cek endpoint produksi
```

Secret service account hanya disimpan di `.secrets/firebase-service-account.json` dan dipasang ke Worker melalui `npm run cloud:secret`.

## Login admin

Saat pertama kali server dijalankan, password admin dibuat otomatis dan disimpan di:

```text
.data/admin-bootstrap.txt
```

Password dapat diganti dari menu Settings di CMS. File `.data` berisi data runtime lokal dan sengaja diabaikan Git.

## Profil CV

Menu **CV** di CMS mendukung beberapa profil, misalnya `IT Support`, `Web Developer`, atau profil lain sesuai kebutuhan.

- Klik **Profil baru** untuk membuat salinan CV yang bisa diedit sendiri.
- Pilih profil dari dropdown untuk mengeditnya.
- Klik **Jadikan CV publik** untuk menentukan profil yang tampil di halaman portfolio dan tombol unduh CV.
- Profil yang sedang tidak aktif tetap tersimpan dan dapat diedit kembali kapan saja.
- Profil terakhir tidak dapat dihapus agar selalu ada satu CV yang tersedia.

Semua profil disimpan di database runtime lokal. Endpoint admin untuk pengelolaan profil adalah `/api/cv-profiles` dan memerlukan login admin.

## Analytics

Dashboard CMS menampilkan kunjungan halaman, download CV, pesan masuk, halaman populer, dan profil CV yang paling sering diunduh. Pencatatan hanya menyimpan hitungan agregat harian tanpa alamat IP, cookie, atau identitas pengunjung. Data analytics disimpan selama 180 hari dan endpoint ringkasannya (`/api/analytics`) hanya dapat diakses admin.

## Pemeriksaan kode

```bash
npm run lint
npm run build
```

Ringkasan audit awal tersimpan di [PROJECT_REVIEW.md](PROJECT_REVIEW.md).
