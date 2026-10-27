/* DATA: 7 pertanyaan kuis, hasil per golongan darah, clue di kartu */

/* ===== pertanyaan ===== (A analis, L lapangan, M medis, S infiltran) */
var QUESTIONS = [
  {
    q: "Alat di ruang prosedur berbunyi alarm tanpa sebab jelas. Karaktermu...",
    o: [
      ["Membuka manual dan memeriksa tiap indikator", "A"],
      ["Mengutak-atik alat sampai alarmnya berhenti", "B"],
      ["Meminta semua orang tetap tenang sambil menanganinya", "O"],
      ["Mundur sebentar dan mengamati apa yang sebenarnya terjadi", "AB"],
    ],
  },
  {
    q: "Seorang senior memberi perintah tanpa menjelaskan alasannya. Karaktermu...",
    o: [
      ["Menjalankannya sesuai perintah dan mencatat semuanya", "A", 1],
      ["Menjalankannya dulu, urusan alasan belakangan", "B", 1],
      ["Menanyakan alasannya dengan sopan sebelum bergerak", "O"],
      ["Menjalankannya sambil diam-diam mencari tahu alasannya", "AB"],
    ],
  },
  {
    q: "Dua rekan berselisih soal cara menangani sampel. Karaktermu...",
    o: [
      ["Mencocokkan keduanya dengan prosedur tertulis", "A"],
      ["Mencoba cara ketiga yang lebih cepat", "B"],
      ["Menengahi dan memutuskan cara yang dipakai", "O"],
      ["Tidak ikut campur, tapi memperhatikan siapa yang benar", "AB"],
    ],
  },
  {
    q: "Shift malam, sendirian di lab. Karaktermu biasanya...",
    o: [
      ["Merapikan catatan dan memeriksa inventaris", "A"],
      ["Mencoba hal-hal yang tidak sempat dilakukan siang hari", "B"],
      ["Berkeliling memastikan semuanya aman", "O"],
      ["Menikmati sunyi dan tenggelam dalam pikirannya", "AB"],
    ],
  },
  {
    q: "Benda yang selalu ada di saku jas lab karaktermu:",
    o: [
      ["Pulpen dan buku catatan kecil", "A"],
      ["Permen, kabel, atau benda acak lainnya", "B"],
      ["Senter kecil dan sarung tangan cadangan", "O"],
      ["Satu benda pribadi yang tidak pernah ia jelaskan", "AB"],
    ],
  },
  {
    q: "Atasan meminta karaktermu menyimpan sebuah data tanpa memberi tahu siapa pun. Karaktermu...",
    o: [
      ["Menyimpannya dan mencatat bahwa ia diminta", "A"],
      ["Menyimpannya begitu saja, bukan urusannya", "B", 1],
      ["Menyimpannya, asal tahu data itu dipakai untuk apa", "O"],
      ["Menyimpannya, lalu membuat salinan untuk dirinya sendiri", "AB"],
    ],
  },
  {
    q: "Rekan baru gugup di hari pertamanya. Karaktermu...",
    o: [
      ["Menjelaskan alur kerja langkah demi langkah", "A"],
      ["Mengajaknya bercanda supaya santai", "B"],
      ["Mendampinginya sampai ia percaya diri", "O"],
      ["Memberinya ruang dan memperhatikan dari jauh", "AB"],
    ],
  },
];
/* Hasil per sifat dominan = golongan darah. Semua trainee berperan Teknisi Medis. Edit teks sesuka tim. */
var RESULT = {
  A: {
    prof: "Teknisi Medis",
    text: "Teliti dan tertib, hampir tidak pernah melewatkan detail kecil. Lebih percaya catatan daripada firasat. Jarang bicara kalau tidak ditanya.",
  },
  B: {
    prof: "Teknisi Medis",
    text: "Cekatan dan spontan, lebih suka langsung bertindak daripada menunggu aba-aba. Sering menemukan cara lain yang tidak ada di prosedur.",
  },
  O: {
    prof: "Teknisi Medis",
    text: "Tenang saat keadaan genting. Orang-orang cenderung menoleh padanya ketika situasi sulit. Tegas, tapi tidak keras.",
  },
  AB: {
    prof: "Teknisi Medis",
    text: "Sulit ditebak. Pengamat yang baik, jarang menjelaskan alasan di balik keputusannya. Nyaman sendirian.",
  },
};
/* Muncul kalau trainee memilih 2 atau lebih jawaban bertanda "patuh" (petunjuk halus soal Prof 01). */
var P_LINE = "Terbiasa menjalankan instruksi tanpa banyak bertanya.";
/* Baris clue di bawah sidik jari. Di sini bisa diselipkan clue halus soal Prof 01. */
var CLUES = [
  "Sampel diambil atas permintaan Prof. 01. Alasan tidak dicantumkan.",
  "Berkas ini diakses lebih dulu oleh Prof. 01 sebelum diarsipkan.",
  "Prof. 01 meminta subjek ini dipertimbangkan untuk misi pencarian.",
];
