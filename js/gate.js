/* Verifikasi kartu: membuka halaman gerbang, membaca QR dari JPG */

/* ===== navigasi ===== */
function openGate() {
  $("g-msg").textContent = "";
  $("g-ok").style.display = "none";
  $("g-file").value = "";
  show("s-gate");
}
$("go-gate2").onclick = openGate;

/* ===== briefing Clue A: tampil setelah verifikasi berhasil ===== */
function renderBrief() {
  var box = $("g-brief");
  if (typeof BRIEFING === "undefined") {
    box.style.display = "none";
    return;
  }
  box.style.display = "";
  box.innerHTML =
    '<div class="brief-h"><span>BRIEFING</span><b>Berkas misi diterima</b></div>' +
    '<p style="margin:0 0 12px;font-size:14px;color:#cfc4bd">Satu berkas briefing sudah disiapkan untukmu. Buka berkasnya, baca baik-baik, lalu pecahkan clue di dalamnya.</p>' +
    '<button class="btn" type="button" id="go-brief">Lanjutkan</button>';
  $("go-brief").onclick = function () {
    openFile(-1, true);
  };
}

/* ===== gerbang misi: baca QR dari JPG ===== */
function decodeFile(file, cb) {
  var fr = new FileReader();
  fr.onload = function () {
    var img = new Image();
    img.onload = function () {
      var base = Math.min(1, 1600 / Math.max(img.width, img.height));
      var tries = [
          base,
          base * 0.6,
          Math.min(1.5 * base, 2400 / Math.max(img.width, img.height)),
        ],
        out = null,
        i;
      for (i = 0; i < tries.length && !out; i++) {
        var w = Math.round(img.width * tries[i]),
          h = Math.round(img.height * tries[i]);
        var cv = document.createElement("canvas");
        cv.width = w;
        cv.height = h;
        var x = cv.getContext("2d");
        x.drawImage(img, 0, 0, w, h);
        var d = x.getImageData(0, 0, w, h);
        out = jsQR(d.data, w, h, { inversionAttempts: "attemptBoth" });
      }
      cb(out ? out.data : null);
    };
    img.onerror = function () {
      cb(null);
    };
    img.src = fr.result;
  };
  fr.onerror = function () {
    cb(null);
  };
  fr.readAsDataURL(file);
}
$("g-file").onchange = function (e) {
  var f = e.target.files && e.target.files[0];
  if (!f) return;
  $("g-ok").style.display = "none";
  $("g-msg").textContent = "> VERIFIKASI IDENTITAS...";
  if (typeof jsQR !== "function") {
    $("g-msg").textContent =
      "Pembaca kode belum termuat. Muat ulang halaman lalu coba lagi.";
    return;
  }
  decodeFile(f, function (raw) {
    if (!raw) {
      $("g-msg").textContent =
        "> AKSES DITOLAK. Kode di kartu tidak terbaca. Pastikan memakai file JPG asli dari web, bukan screenshot atau gambar yang dipotong.";
      return;
    }
    var data = readCode(raw);
    if (!data) {
      $("g-msg").textContent =
        "> AKSES DITOLAK. Kartu tidak valid. Isi kartu tidak cocok dengan tanda pengamannya.";
      return;
    }
    $("g-msg").textContent = "";
    $("g-name").textContent = data.name;
    $("g-prof").textContent = RESULT[data.type].prof;
    $("g-blood").textContent = data.blood;
    $("g-lvl").textContent = data.lvl;
    renderBrief();
    $("g-ok").style.display = "block";
  });
};
