# Telaah PORTFOLIO-APPS

Tanggal: 13 September 2026. Ruang lingkup: kode lokal, konfigurasi build/deployment, pengujian API pada salinan sementara, dan pemeriksaan browser halaman Contact serta About. Tidak ada perubahan pada kode aplikasi atau database asli dalam telaah ini.

**Penilaian:** fitur portofolio dan CMS sudah cukup luas, tetapi versi ini belum layak dipublikasikan sebagai CMS yang aman. Penghalang utamanya adalah autentikasi API yang belum ada, keterbukaan data privat, serta pelaporan sukses saat data gagal disimpan. Ada pula bug fungsional yang sudah terlihat pada data dan tampilan saat ini.

## Arsitektur dan cakupan fitur

| Bagian | Implementasi saat ini |
| --- | --- |
| Frontend | React 19, Vite 8, JavaScript/JSX, CSS khusus, ikon Lucide |
| Navigasi | Router manual berbasis History API dan state dalam PortfolioContext |
| Halaman publik | Home, Projects, Blog, detail artikel, About, Contact |
| CMS | Dashboard, proyek, artikel, media, CV, skill/karier, inbox, pengaturan |
| Backend | Express, REST API, Multer untuk upload |
| Database | Satu file JSON; read/write sinkron; penulisan melalui file sementara dan rename |
| Media | File lokal di uploads; konfigurasi dan skrip migrasi S3 masih parsial |
| Resume | Template React bilingual; ekspor html2pdf.js |
| Deployment | Dev/preview Vite dengan proxy; Docker Nginx statis; batch Windows untuk preview dan tunnel |

Pemisahan halaman, komponen, dan tab CMS sudah membantu navigasi kode. Variabel tema CSS dan helper bahasa bisa dipertahankan. Penulisan database melalui file sementara lalu rename juga merupakan dasar yang baik, tetapi penanganan kegagalannya perlu diperbaiki.

## Temuan berdasarkan prioritas

P1 = harus diselesaikan sebelum penggunaan publik/operasional. P2 = bug fitur atau kualitas yang perlu diperbaiki berikutnya. Tingkat keparahan dinilai dari implementasi lokal; pengamanan tambahan di luar repository tidak diaudit.

### 1. [P1] API administrasi tidak memiliki autentikasi

Login hanya membandingkan passcode di browser dan mengubah boolean React. Semua endpoint PUT/POST/DELETE administrasi tetap menerima permintaan tanpa session/token, termasuk perubahan profil, pengaturan, penghapusan konten, upload, dan reset seluruh data.

**Bukti:** PUT profil tanpa kredensial pada server salinan mendapat HTTP 200 dan perubahan benar-benar tersimpan.

**Perbaikan:** login dan pemeriksaan akses harus dilakukan backend; simpan hash password di server, gunakan sesi yang diverifikasi untuk setiap endpoint admin, dan batasi percobaan login. Mengganti PIN pada UI saja tidak menutup masalah ini.

Lokasi: [AdminLoginModal.jsx:12](D:/Abdi/PORTFOLIO-APPS/src/cms/AdminLoginModal.jsx:12), [server/index.js:194](D:/Abdi/PORTFOLIO-APPS/server/index.js:194), [reset:377](D:/Abdi/PORTFOLIO-APPS/server/index.js:377).

### 2. [P1] Endpoint publik membocorkan passcode dan inbox

GET /api/data mengirim seluruh database, termasuk settings.adminPasscode dan messages. Frontend meminta endpoint ini setiap kali aplikasi dimuat, sebelum login admin. Menghilangkan menu admin tidak membatasi akses data tersebut.

**Bukti:** server salinan memberikan HTTP 200 tanpa kredensial dan memuat kedua field tersebut. Nilai passcode tidak dicantumkan dalam laporan.

**Perbaikan:** buat respons publik dengan daftar field yang diizinkan; pisahkan endpoint inbox dan pengaturan privat yang membutuhkan autentikasi. Database runtime juga sudah dilacak Git, sehingga perlu dipisahkan dari seed yang aman untuk repository.

Lokasi: [server/index.js:81](D:/Abdi/PORTFOLIO-APPS/server/index.js:81), [PortfolioContext.jsx:74](D:/Abdi/PORTFOLIO-APPS/src/context/PortfolioContext.jsx:74).

### 3. [P1] Upload menerima konten aktif dan dapat diakses tanpa login

Multer tidak memiliki validasi tipe/isi file. File langsung dilayani melalui express.static. HTML bisa diunggah dan dibuka sebagai halaman pada origin aplikasi. Batas 100 MB per file dan 20 file per request juga memungkinkan penggunaan disk besar; tidak ditemukan pembatasan frekuensi request.

**Bukti:** file HTML statis tanpa skrip diterima dengan HTTP 201 pada salinan, lalu dilayani HTTP 200 sebagai text/html tanpa Content-Disposition attachment. Tidak dilakukan pengujian eksekusi skrip.

**Perbaikan:** autentikasi upload, allowlist tipe file dan pemeriksaan isi, batas ukuran/kuota yang sesuai, serta penanganan HTML/SVG aktif melalui penolakan, sanitasi, atau origin terpisah. Lengkapi cleanup file ketika upload atau penyimpanan metadata gagal.

Lokasi: [server/index.js:37](D:/Abdi/PORTFOLIO-APPS/server/index.js:37), [konfigurasi upload:60](D:/Abdi/PORTFOLIO-APPS/server/index.js:60).

### 4. [P1] Kegagalan penyimpanan dilaporkan sebagai sukses

writeDB mengembalikan false ketika gagal, tetapi pemanggil tetap merespons sukses. Frontend juga banyak mengubah state sebelum hasil request diketahui, tidak memeriksa res.ok, dan menampilkan toast sukses. Form kontak langsung dikosongkan tanpa menunggu hasil addMessage; saat jaringan gagal, pesan hanya dimasukkan ke state lokal dan dianggap terkirim.

**Bukti:** pada salinan, file sementara database sengaja dibuat tidak dapat ditulis sebagai file. PUT tetap menghasilkan HTTP 200 dan success:true, padahal profil baru tidak tersimpan.

**Perbaikan:** propagasikan error database menjadi respons gagal; periksa status HTTP pada seluruh operasi, tunggu penyimpanan sebelum menutup/mengosongkan form, dan rollback state bila memakai pembaruan optimistis. Saat database gagal dibaca, jangan diam-diam memakai seed lalu menimpa data lama pada operasi berikutnya.

Lokasi: [server/db.js:44](D:/Abdi/PORTFOLIO-APPS/server/db.js:44), [PortfolioContext.jsx:254](D:/Abdi/PORTFOLIO-APPS/src/context/PortfolioContext.jsx:254), [addMessage:410](D:/Abdi/PORTFOLIO-APPS/src/context/PortfolioContext.jsx:410), [ContactPage.jsx:18](D:/Abdi/PORTFOLIO-APPS/src/pages/ContactPage.jsx:18).

### 5. [P1] Input API tidak divalidasi dan dapat merusak render halaman

Endpoint menyimpan req.body langsung. POST proyek dengan objek kosong diterima, sementara halaman Projects langsung memanggil title.toLowerCase(), summary.toLowerCase(), dan tags.some(). Pesan kontak kosong juga diterima. Sebagian update/delete mengembalikan sukses walaupun ID tidak ditemukan.

**Bukti:** POST proyek kosong mendapat HTTP 201; akses title.toLowerCase() pada objek hasilnya menghasilkan TypeError. POST pesan kosong juga mendapat HTTP 201.

**Perbaikan:** validasi schema dan panjang data, tolak field yang tidak boleh diubah seperti identitas record, kembalikan 400/404 yang sesuai, dan tambahkan penanganan error halaman.

Lokasi: [server/index.js:264](D:/Abdi/PORTFOLIO-APPS/server/index.js:264), [ProjectsPage.jsx:23](D:/Abdi/PORTFOLIO-APPS/src/pages/ProjectsPage.jsx:23).

### 6. [P1] Judul yang sama menghasilkan ID kembar

ID artikel dan proyek hanya dibuat dari slug judul, tanpa pemeriksaan keunikan. Operasi update menggunakan map dan delete menggunakan filter, sehingga semua record dengan ID sama ikut berubah atau terhapus.

**Bukti:** dua artikel berjudul sama menghasilkan ID identik; menghapus satu ID mengubah jumlah record cocok dari 2 menjadi 0.

**Perbaikan:** gunakan ID internal unik dan slug unik yang terpisah; tentukan perilaku saat judul/slug berbenturan.

Lokasi: [server/index.js:227](D:/Abdi/PORTFOLIO-APPS/server/index.js:227), [delete artikel:250](D:/Abdi/PORTFOLIO-APPS/server/index.js:250), [proyek:264](D:/Abdi/PORTFOLIO-APPS/server/index.js:264).

### 7. [P1] Docker tidak menjalankan backend aplikasi

Image final hanya berisi Nginx dan dist. Compose tidak memiliki service Express maupun volume database/upload. Nginx tidak mem-proxy /api atau /uploads; GET /api/data akan terkena fallback SPA, bukan menghasilkan JSON dari backend. Script npm run serve juga melayani dist tanpa konfigurasi proxy API.

**Perbaikan:** sediakan backend service, proxy API/upload, serta volume persisten. Gunakan satu jalur deployment yang tervalidasi. Temuan ini berdasarkan konfigurasi; container tidak dijalankan dalam audit.

Lokasi: [Dockerfile:17](D:/Abdi/PORTFOLIO-APPS/Dockerfile:17), [docker-compose.yml:1](D:/Abdi/PORTFOLIO-APPS/docker-compose.yml:1), [nginx.conf:15](D:/Abdi/PORTFOLIO-APPS/nginx.conf:15), [package.json:14](D:/Abdi/PORTFOLIO-APPS/package.json:14).

### 8. [P2] Impor dan ekspor backup JSON belum diimplementasikan

SettingsTab mengambil exportDataJSON dan importDataJSON dari context, tetapi context tidak menyediakan keduanya. Tombol ekspor tidak memiliki handler aktif; impor memanggil undefined setelah FileReader selesai.

**Perbaikan:** implementasikan backup/restore pada backend yang terlindungi, validasi format dan versi backup, serta jelaskan cakupan file media dalam backup.

Lokasi: [SettingsTab.jsx:6](D:/Abdi/PORTFOLIO-APPS/src/cms/SettingsTab.jsx:6), [impor:48](D:/Abdi/PORTFOLIO-APPS/src/cms/SettingsTab.jsx:48), [ekspor:362](D:/Abdi/PORTFOLIO-APPS/src/cms/SettingsTab.jsx:362).

### 9. [P2] Form kontak dan menu terpotong pada ponsel

Contact grid tetap dua kolom pada ukuran kecil. Navbar mempertahankan seluruh aksi sehingga tombol menu terdorong keluar layar. CSS global menyembunyikan overflow horizontal. Ada pula nilai CSS tidak valid flex-direction: flex-col-reverse pada kartu proyek horizontal.

**Bukti browser pada viewport 390 px:** lebar dokumen 585 px; form berada pada x=343 hingga 552 px; tombol menu berada pada x=485 hingga 509 px. Screenshot menunjukkan form terpotong. Ini membuat jalur kontak dan navigasi sulit digunakan di ponsel.

**Perbaikan:** ubah contact grid menjadi satu kolom pada breakpoint kecil, sesuaikan aksi navbar dan lebar minimum kartu, serta ganti nilai flex-direction menjadi column-reverse jika itu urutan yang diinginkan.

Lokasi: [pages.css:574](D:/Abdi/PORTFOLIO-APPS/src/styles/pages.css:574), [pages.css:665](D:/Abdi/PORTFOLIO-APPS/src/styles/pages.css:665), [navbar.css:170](D:/Abdi/PORTFOLIO-APPS/src/styles/navbar.css:170).

### 10. [P2] Sumber data CV dan skill/karier tidak konsisten

AboutPage membuat kategori dari skills utama, tetapi mengambil isi dari cvData.skills ketika tersedia. Pada database sekarang, skills utama kosong dan CV memiliki tujuh skill; hasilnya seluruh bagian skill publik kosong. Timeline juga lebih memilih pengalaman CV, sehingga perubahan melalui tab Skill & Karir bisa tidak tercermin pada halaman publik.

**Bukti:** inspeksi database menemukan 0 skill utama dan 7 skill CV; browser About menampilkan judul bagian skill tanpa kartu skill.

**Perbaikan:** tentukan satu sumber data untuk setiap tampilan; hitung kategori dan isi dari array yang sama. Bila CV sengaja memiliki data terpisah, jelaskan cakupan edit kedua tab.

Lokasi: [AboutPage.jsx:44](D:/Abdi/PORTFOLIO-APPS/src/pages/AboutPage.jsx:44), [timeline:162](D:/Abdi/PORTFOLIO-APPS/src/pages/AboutPage.jsx:162), [skill:211](D:/Abdi/PORTFOLIO-APPS/src/pages/AboutPage.jsx:211).

### 11. [P2] Ekspor CV memakai rasterisasi dan penanganan error asinkron keliru

Pipeline html2pdf yang dipakai mengubah canvas menjadi gambar dan menambahkannya ke PDF. Karena itu label ATS-compliant belum didukung lapisan teks PDF yang dapat diekstrak dari pipeline ini. Ini perlu diganti jika CV ditujukan untuk pembacaan teks oleh sistem rekrutmen; perilaku OCR tiap sistem tidak diuji.

Di AboutPage dan CvTab, await downloadAtsPdf berada dalam callback setTimeout, sedangkan try/catch berada di luar callback. Rejection ekspor tidak tertangkap oleh catch tersebut dan dapat membiarkan tombol tetap dalam status generating. Tombol Cetak memanggil window.print(), tetapi tidak ada stylesheet print yang membatasi hasil ke resume. Upload resumeUrl di Settings juga tidak dipakai oleh tombol unduh CV publik.

**Perbaikan:** gunakan generator PDF dengan teks asli atau jalur cetak yang terkontrol; tangani await dan finally dalam scope asinkron yang sama; tentukan hubungan antara PDF unggahan dan PDF hasil generator.

Lokasi: [AtsResumeTemplate.jsx:327](D:/Abdi/PORTFOLIO-APPS/src/components/AtsResumeTemplate.jsx:327), [AboutPage.jsx:21](D:/Abdi/PORTFOLIO-APPS/src/pages/AboutPage.jsx:21), [CvTab.jsx:66](D:/Abdi/PORTFOLIO-APPS/src/cms/CvTab.jsx:66). Bukti pipeline lokal: node_modules/html2pdf.js/src/worker.js baris 216–217. Hasil PDF unduhan belum diuji ekstraksi teks/render.

### 12. [P2] Bahasa Inggris dan pencarian belum konsisten

ContactPage masih menggunakan teks Indonesia langsung. Home selalu memakai profile.bio meskipun bioEn tersedia. Kartu proyek/artikel diterjemahkan, tetapi pencarian hanya memeriksa title/summary/excerpt bahasa utama. Kata dalam judul Inggris yang terlihat dapat menghasilkan pencarian kosong. Atribut html lang juga tetap id.

**Perbaikan:** gunakan data terlokalisasi secara konsisten untuk tampilan dan pencarian; pindahkan teks publik ke kamus terjemahan dan sinkronkan bahasa dokumen.

Lokasi: [HomePage.jsx:25](D:/Abdi/PORTFOLIO-APPS/src/pages/HomePage.jsx:25), [ContactPage.jsx:1](D:/Abdi/PORTFOLIO-APPS/src/pages/ContactPage.jsx:1), [ProjectsPage.jsx:23](D:/Abdi/PORTFOLIO-APPS/src/pages/ProjectsPage.jsx:23), [BlogPage.jsx:21](D:/Abdi/PORTFOLIO-APPS/src/pages/BlogPage.jsx:21).

### 13. [P2] Dukungan S3 belum lengkap

Mengubah STORAGE_DRIVER tidak mengganti upload Multer yang tetap lokal. Migrasi hanya mengubah URL pada daftar media, bukan referensi di profil/proyek. Salin URL pada MediaTab selalu menambahkan window.location.origin sehingga URL S3 absolut menjadi salah. Delete menghapus file fisik hanya untuk driver lokal; objek S3 akan tertinggal.

**Perbaikan:** lengkapi operasi upload/delete/resolve URL di adapter, gunakan URL absolut dengan benar, dan migrasikan semua referensi aset. Ini temuan kesiapan fitur; S3 tidak digunakan dalam pengujian dan tidak diuji ke layanan eksternal.

Lokasi: [storageAdapter.js:71](D:/Abdi/PORTFOLIO-APPS/server/storage/storageAdapter.js:71), [migrateToS3.js:81](D:/Abdi/PORTFOLIO-APPS/server/storage/migrateToS3.js:81), [MediaTab.jsx:138](D:/Abdi/PORTFOLIO-APPS/src/cms/MediaTab.jsx:138), [server/index.js:179](D:/Abdi/PORTFOLIO-APPS/server/index.js:179).

### 14. [P2] Akses keyboard dan semantik antarmuka belum memadai

Kartu blog dan sejumlah kartu proyek menggunakan div onClick tanpa jalur keyboard untuk membuka detail. FAQ juga berupa div yang diklik. Label form tidak terhubung dengan input melalui htmlFor/id; modal belum memiliki semantik dialog dan pengelolaan fokus. Tombol kehilangan outline secara global tanpa pengganti fokus yang konsisten. Template CV yang diletakkan di luar layar tetap muncul dalam accessibility tree halaman About.

**Perbaikan:** gunakan link/button semantik, sambungkan label input, lengkapi fokus keyboard serta modal, dan keluarkan template ekspor tersembunyi dari accessibility tree.

Lokasi: [BlogCard.jsx:13](D:/Abdi/PORTFOLIO-APPS/src/components/BlogCard.jsx:13), [ProjectModal.jsx:15](D:/Abdi/PORTFOLIO-APPS/src/components/ProjectModal.jsx:15), [ContactPage.jsx:128](D:/Abdi/PORTFOLIO-APPS/src/pages/ContactPage.jsx:128), [main.css:94](D:/Abdi/PORTFOLIO-APPS/src/styles/main.css:94).

## Performa, maintainability, dan operasional

- Build menghasilkan satu bundle JavaScript sekitar **1.330 kB**, gzip **373 kB**, dan peringatan chunk >500 kB. App mengimpor semua halaman/CMS secara statis, dan About mengimpor generator PDF. Pisahkan halaman admin dan generator PDF dengan dynamic import.
- PortfolioContext menangani data, CRUD, routing, tema, bahasa, login, modal, dan toast dalam satu file. Pisahkan lapisan request API dan domain data agar penanganan error tidak berulang dan sulit diselaraskan.
- Loading dataset tersedia tetapi tidak dipakai oleh halaman utama. Saat API gagal, seed tampil seolah merupakan data aktual. Tambahkan status loading/error yang jelas.
- Router manual mengembalikan halaman Home untuk URL tidak dikenal dan Blog untuk slug tidak ditemukan; tidak ada halaman 404 yang konsisten. Metadata judul/deskripsi tetap sama untuk semua artikel. Perbaiki routing serta metadata sesuai kebutuhan SEO.
- Database JSON memadai untuk prototipe satu proses, tetapi membaca/menulis seluruh dataset secara sinkron pada setiap request. Untuk penggunaan lebih besar, pertimbangkan penyimpanan bertransaksi; jangan menganggap file sementara sudah menyediakan koordinasi lintas proses.
- README masih template Vite. Dokumentasikan perintah start, port/proxy, konfigurasi lingkungan, backup/restore, dan deployment. Tidak ditemukan script test atau suite pengujian aplikasi; tambahkan regresi yang menutup temuan di atas.
- start_services.bat memakai path absolut mesin ini dan mengumumkan sukses tanpa pemeriksaan kesehatan server/tunnel. Jadikan konfigurasi port/path eksplisit dan tunggu health check sebelum menyatakan layanan siap.

## Validasi yang dijalankan

| Pemeriksaan | Hasil |
| --- | --- |
| npm run build | Berhasil; peringatan bundle besar |
| npm run lint | Exit 0; masih ada warning unused variables, dependency hook, dan Fast Refresh |
| API pada salinan sementara | Tujuh kelompok pemeriksaan mengonfirmasi temuan autentikasi, data privat, ID kembar, input proyek kosong, pesan kosong, upload HTML, dan kegagalan tulis |
| Browser Contact, 390 px | Form dan menu terpotong; ukuran DOM dicatat di atas |
| Browser About, viewport normal | Bagian skill kosong; template CV tersembunyi tetap muncul pada accessibility tree |
| Integritas workspace | Kode dan database asli tidak diubah; hanya laporan ini ditambahkan. Build memperbarui folder dist yang diabaikan Git |

Pengujian mutasi API memakai source backend yang disalin dan database seed sementara, kemudian proses dihentikan serta direktori sementara dihapus. Tidak ada reset, upload, atau perubahan konten melalui server asli. Audit tidak mencakup uji beban, pemindaian dependency vulnerability, pengujian container, ekstraksi PDF hasil unduh, audit layanan publik/tunnel, atau seluruh alur CMS melalui browser.

## Urutan perbaikan yang disarankan

1. Amankan autentikasi backend, pisahkan data publik/privat, dan batasi upload.
2. Benahi validasi, ID unik, error database/API, serta kepastian pengiriman form kontak.
3. Pulihkan backup/restore, satukan aturan sumber data CV/karier, dan perbaiki tampilan ponsel.
4. Validasi deployment backend + frontend + penyimpanan persisten.
5. Perbaiki ekspor PDF, bahasa, aksesibilitas, routing/SEO, kemudian ukuran bundle dan dokumentasi.
