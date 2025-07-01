# Skylum Draw Simple
_Aplikasi web menggambar ringan, profesional, dan imersif seperti Paint/Photoshop versi sederhana._

---

## Daftar Isi

1. [Fitur Utama](#fitur-utama)
2. [Cara Pakai](#cara-pakai)
3. [Struktur Proyek](#struktur-proyek)
4. [Inspirasi & Use Case](#inspirasi--use-case)
5. [Lisensi & Filosofi](#lisensi--filosofi)
6. [Integrasi Blockchain: Dari Karya Seni ke Aset Digital](#integrasi-blockchain-dari-karya-seni-ke-aset-digital)

---

## Fitur Utama

### Peralatan Profesional
- **Kuas raster**: Menggambar bebas dengan berbagai ukuran dan warna.
- **Kuas kustom**: Membuat dan menggunakan bentuk kuas sendiri.
- **Gambar vektor (path, bezier)**: Membuat garis, kurva, dan bentuk vektor yang dapat diedit.
- **Fill/Bucket tool**: Mengisi area tertutup dengan warna secara instan.
- **Crop tool**: Memotong area kanvas sesuai kebutuhan.
- **Eraser tool**: Menghapus bagian gambar secara selektif.
- **Color picker**: Memilih warna dari kanvas.
- **Shape tool**: Membuat bentuk dasar seperti persegi, lingkaran, garis lurus.
- **Text tool**: Menambahkan teks ke kanvas.

### Manajemen Layer
- **Tambah/hapus layer**: Menambah atau menghapus layer gambar.
- **Duplikasi layer**: Menggandakan layer yang ada.
- **Kunci layer**: Mengunci layer agar tidak bisa diedit.
- **Grup/Ungroup layer**: Mengelompokkan beberapa layer menjadi satu grup atau memisahkannya.
- **Preview thumbnail layer**: Melihat pratinjau kecil setiap layer.
- **Ubah urutan layer (drag & drop)**: Mengatur posisi layer dengan mudah.
- **Opacity & blending mode**: Mengatur transparansi dan mode pencampuran layer.

### Kanvas & UX
- **Zoom & pan interaktif**: Memperbesar, memperkecil, dan menggeser kanvas.
- **Grid & snap**: Menampilkan grid dan fitur snap-to-grid untuk presisi.
- **Desain responsif**: Tampilan optimal di desktop, tablet, dan mobile.
- **Dark mode**: Tema gelap untuk kenyamanan mata.
- **Gestur sentuh (pinch-to-zoom, drag)**: Navigasi mudah di perangkat sentuh.
- **Tooltip bantuan**: Penjelasan singkat saat hover pada ikon/tool.
- **Multi-canvas/tab**: Membuka beberapa kanvas dalam satu aplikasi.
- **Auto-save**: Penyimpanan otomatis secara berkala.

### Produktivitas
- **History panel visual**: Melihat dan melompat ke riwayat perubahan secara visual.
- **Undo/redo tanpa batas**: Membatalkan atau mengulang aksi tanpa batas.
- **Shortcut keyboard**: Navigasi dan akses fitur dengan kombinasi tombol.
- **Import/export (PNG, JPG, SVG, PSD)**: Mendukung berbagai format file.
- **Drag & drop file**: Membuka file gambar dengan drag & drop.
- **Export layer terpisah**: Mengekspor setiap layer sebagai file terpisah.
- **Template & preset**: Memulai dari template atau preset ukuran kanvas.

### Kolaborasi
- **Menggambar bersama secara real-time via WebSocket**: Kolaborasi langsung dengan pengguna lain.
- **Chat kolaborasi**: Fitur chat untuk diskusi saat kolaborasi.
- **Komentar pada layer/area**: Memberi catatan atau komentar pada bagian tertentu.

### Keamanan & Privasi
- **Mode privat**: Membatasi akses kanvas hanya untuk pengguna tertentu.
- **Backup & restore**: Fitur cadangan dan pemulihan proyek.

---

**Fitur yang Belum Selesai/Belum Diimplementasikan Sepenuhnya:**
- Kuas kustom (custom brush)
- Gambar vektor (path, bezier)
- Fill/Bucket tool
- Crop tool
- Grup/Ungroup layer
- Preview thumbnail layer
- Ubah urutan layer (drag & drop)
- Opacity & blending mode
- Grid & snap
- Gestur sentuh (pinch-to-zoom, drag)
- Tooltip bantuan
- Multi-canvas/tab
- Auto-save
- History panel visual
- Drag & drop file
- Export layer terpisah
- Template & preset
- Kolaborasi real-time via WebSocket
- Chat kolaborasi
- Komentar pada layer/area
- Mode privat
- Backup & restore
- Integrasi blockchain (mint NFT, wallet, dsb)

---

## Cara Pakai

1. **Buka aplikasi** di browser dengan membuka `index.html` atau akses secara online.
2. **Pilih alat gambar** dari toolbar di sisi kiri.
3. **Mulai menggambar** di kanvas, gunakan layer & fitur lain sesuai kebutuhan.
4. **Simpan atau ekspor** hasil karya ke format PNG, JPG, atau SVG.

---

## Struktur Proyek

```
/skylum-draw-simple
|-- index.html
|-- /src
|   |-- app.js
|   |-- canvas.js
|   |-- tools.js
|   |-- layers.js
|   |-- history.js
|   |-- websocket.js
|   |-- /styles
|   |   |-- style.css
|   |   |-- dark-mode.css
|   |-- /assets
|       |-- logo.png
|       |-- brush.png
|       |-- bucket.png
|       |-- crop.png
|-- /docs
|   |-- README.md
|   |-- LICENSE
|-- /tests
|   |-- app.test.js
|   |-- canvas.test.js
|   |-- tools.test.js
|   |-- layers.test.js
|   |-- history.test.js
|   |-- websocket.test.js
```

### Keterangan Struktur Proyek
- `index.html`: Berkas utama untuk memuat aplikasi.
- `/src`: Kode sumber aplikasi.
  - `app.js`: Berkas utama aplikasi.
  - `canvas.js`: Mengelola kanvas gambar.
  - `tools.js`: Alat gambar (kuas, bucket, crop).
  - `layers.js`: Manajemen layer gambar.
  - `history.js`: Menyimpan riwayat tindakan untuk undo/redo.
  - `websocket.js`: Mengelola koneksi WebSocket untuk kolaborasi real-time.
  - `/styles`: Berkas CSS untuk gaya aplikasi.
  - `/assets`: Gambar dan ikon yang digunakan dalam aplikasi.
- `/docs`: Dokumentasi proyek.
  - `README.md`: Penjelasan dan petunjuk penggunaan aplikasi.
  - `LICENSE`: Informasi lisensi proyek.
- `/tests`: Berkas pengujian untuk memastikan kualitas kode.
  - `app.test.js`: Pengujian untuk app.js.
  - `canvas.test.js`: Pengujian untuk canvas.js.
  - `tools.test.js`: Pengujian untuk tools.js.
  - `layers.test.js`: Pengujian untuk layers.js.
  - `history.test.js`: Pengujian untuk history.js.
  - `websocket.test.js`: Pengujian untuk websocket.js.

---

## Inspirasi & Use Case

_Skylum Draw Simple_ terinspirasi dari kebutuhan akan alat menggambar yang ringan namun kaya fitur, menggabungkan kemudahan penggunaan dengan kemampuan profesional. Beberapa contoh penggunaan meliputi:
- Ilustrator digital yang membutuhkan alat cepat dan responsif.
- Desainer yang ingin membuat sketsa konsep dengan mudah.
- Pengguna biasa yang ingin menggambar atau mencatat ide dengan cepat.

---

## Lisensi & Filosofi

_Skylum Draw Simple_ adalah proyek sumber terbuka yang mengusung filosofi keterbukaan dan kolaborasi. Kami percaya bahwa alat kreatif seharusnya dapat diakses oleh siapa saja, di mana saja. Untuk informasi lebih lanjut mengenai lisensi, silakan lihat berkas `LICENSE` dalam repositori ini.

---

## Integrasi Blockchain: Dari Karya Seni ke Aset Digital

Salah satu fitur unggulan dari _Skylum Draw Simple_ adalah kemampuannya untuk mengintegrasikan karya seni yang dibuat dalam aplikasi ini ke dalam ekosistem blockchain. Dengan demikian, setiap karya seni tidak hanya menjadi file digital biasa, tetapi juga dapat dianggap sebagai aset digital yang memiliki nilai dan dapat diperdagangkan.

### Cara Kerja
1. **Buat Karya Seni**: Gunakan alat dan fitur yang ada untuk membuat karya seni digital Anda.
2. **Simpan ke Blockchain**: Setelah selesai, karya seni dapat disimpan ke dalam blockchain dengan mengubahnya menjadi token non-fungible (NFT).
3. **Perdagangan & Kepemilikan**: Karya seni yang telah menjadi NFT dapat diperdagangkan di pasar blockchain, dan kepemilikannya dapat diverifikasi secara publik.

### Manfaat
- **Keaslian & Kepemilikan**: Setiap karya seni memiliki bukti keaslian dan kepemilikan yang tercatat di blockchain.
- **Nilai Investasi**: Karya seni digital dapat memiliki nilai yang meningkat seiring waktu, tergantung pada permintaan dan popularitas seniman.
- **Royalti Otomatis**: Seniman dapat menerima royalti secara otomatis setiap kali karya seninya diperdagangkan di pasar sekunder.

Dengan integrasi ini, _Skylum Draw Simple_ tidak hanya menjadi alat untuk berkarya, tetapi juga menjadi jembatan menuju dunia seni digital yang lebih luas dan bernilai.
