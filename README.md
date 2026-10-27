# SPECTRAL XDGE 0.1 · Generation 06

Situs rekrutmen bergaya arsip lab: pendaftaran + kuis golongan darah, kartu JPG ber-QR, verifikasi kartu,
Team Lineup, Arsip (map dan buku lembaran), dan halaman Prosedur yang dikunci sandi.
Situs statis murni (HTML, CSS, JavaScript biasa), tanpa build, tanpa server khusus.

## Struktur

```
index.html              kerangka halaman (semua layar ada di sini)
css/
  base.css              warna (:root), reset, tombol, form, kuis, hasil
  theme.css             tema kertas/berkas, log terminal
  home.css              beranda: hero, tiga menu, ikon
  procedure.css         Prosedur: layar terkunci + form kertas + sampul buku
  gate.css              verifikasi kartu (pemindai)
  team.css              kartu anggota + pop up detail
  archive.css           tumpukan map + halaman berkas (buku lembaran)
  animations.css        SEMUA @keyframes, ubah gerak di sini
js/
  core.js               helper $, navigasi antar layar, utilitas acak
  data/                 isi yang sering kamu ubah:
    team.js             anggota
    archive.js          berkas arsip (DIBUAT OTOMATIS dari tools/archive.json)
    questions.js        7 pertanyaan, hasil, clue
    sprite.js           data sprite sidik jari (jarang diubah)
  vault.js              isi Prosedur TERENKRIPSI (dibuat otomatis, jangan diedit)
  card.js               menggambar kartu, kode QR + tanda pengaman
  quiz.js               form, pertanyaan, hasil, unduh JPG
  gate.js               baca QR dari JPG, verifikasi
  procedure.js          cek sandi + dekripsi + animasi buka segel
  team.js               render kartu anggota + pop up
  keypad.js             keypad kode angka (panel brankas)
  archive.js            map, sampul, balik halaman
assets/                 gambar: template kartu, sprite, ikon, foto anggota
tools/
  procedure.html        isi Prosedur (teks biasa, edit di sini)
  encrypt.py            membuat js/vault.js dari procedure.html + sandi
  archive.json          isi semua berkas arsip + kode angka pembukanya (teks biasa)
  build_archive.py      membuat js/data/archive.js (mengenkripsi berkas 2 dst)
```

Urutan `<script>` di `index.html` penting (data dulu, baru logika). Semua file berbagi satu lingkup global.

## Cara mengubah isi

| Mau ubah | Edit | Catatan |
|---|---|---|
| Nama/peran/bio/foto anggota | `js/data/team.js` | foto taruh di `assets/team/`, isi `img: "assets/team/nama.jpg"` (rasio 3:4) |
| Briefing Clue A, berkas arsip, kode angka | `tools/archive.json` lalu `python tools/build_archive.py` | lihat bagian Arsip di bawah |
| Pertanyaan kuis dan hasil | `js/data/questions.js` | |
| Isi Prosedur | `tools/procedure.html` lalu jalankan `encrypt.py` | lihat di bawah |
| Warna utama | `css/base.css` bagian `:root` | |
| Kecepatan/gaya animasi | `css/animations.css` dan baris `animation`/`transition` di CSS tiap halaman | |

## Arsip: clue berantai dengan kode angka

Alur peserta: lolos Verifikasi, lalu muncul **briefing Clue A**. Jawaban Clue A (angka) membuka **Berkas 01**. Narasi di
Berkas 01 berakhir dengan **Clue B**, jawabannya membuka **Berkas 02**, dan seterusnya. Urutannya ketat (tidak bisa loncat).

- Semua berkas terkunci. Peserta mengetik kode di keypad: lewat map di beranda (hanya berkas berikutnya dalam urutan)
  atau lewat halaman segel di akhir berkas sebelumnya.
- Di `tools/archive.json`: `briefing` (teks Clue A, publik), lalu tiap berkas: `code`, `name` (publik), `sandi` (kode angka
  untuk MEMBUKA berkas itu), `sum`, `note` (sticky note), `bio` (daftar paragraf).
- Tulis Clue berikutnya sebagai paragraf terakhir `bio`, dan jawabannya jadi `sandi` berkas berikutnya.
- Setelah mengedit, jalankan `python tools/build_archive.py`. Isi tiap berkas dienkripsi, jadi tidak terbaca di source.
  Teks briefing tidak dienkripsi.
- Berkas yang sudah dibuka diingat di perangkat itu (localStorage). Untuk mengujinya dari awal, buka `index.html?reset`.
- Pakai kode minimal 8 digit. Kode pendek bisa ditebak lewat komputer.

## Mengganti isi atau sandi Prosedur

```bash
pip install cryptography
python tools/encrypt.py "sandi-baru"
```

Ini menulis ulang `js/vault.js`. Setelah itu commit dan unggah ulang. Huruf besar/kecil sandi tidak dibedakan.
Gunakan sandi yang panjang, karena isi terenkripsi ikut terunggah dan bisa ditebak offline kalau sandinya pendek.

## Menjalankan di komputer

Buka lewat server lokal, jangan klik dua kali `index.html` (gambar kartu dan dekripsi sandi butuh `http://` atau `https://`):

```bash
python -m http.server 8000
# lalu buka http://localhost:8000
```

## Deploy

- **Netlify**: seret seluruh folder ini ke Netlify Drop, atau hubungkan repo GitHub. Build command kosong, publish directory `/`.
- **GitHub Pages**: Settings, Pages, Branch `main`, folder `/ (root)`. File `.nojekyll` sudah disertakan.

## Catatan keamanan (penting kalau repo publik)

- `tools/procedure.html` berisi isi Prosedur dalam teks biasa (termasuk nomor kontak). File ini sudah masuk `.gitignore`
  supaya tidak ikut ter-commit. Kalau repo-mu private dan mau menyimpannya, hapus baris itu dari `.gitignore`.
- Kunci Prosedur dan pengecekan kartu berjalan di browser. Itu cukup untuk permainan, tapi bukan keamanan sungguhan.
  `SECRET` di `js/card.js` terlihat oleh siapa pun yang membuka source; ganti nilainya dengan teks acak milikmu sendiri.
- Library QR dan font diambil dari jsDelivr dan Google Fonts (versi dikunci). Perlu koneksi internet saat dibuka.
