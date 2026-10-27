# SPECTRAL XDGE 0.1 · Generation 06

Website SPX: pendaftaran + kuis golongan darah, kartu JPG ber-QR, verifikasi kartu,
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
