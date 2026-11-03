/* Keypad kode angka: panel brankas untuk membuka berkas arsip (jawaban clue = kode angka) */

/* panjang kode sengaja tidak ditampilkan: kp.max hanya batas atas input, dicek lewat tombol BUKA / Enter */
var kp = { i: -1, buf: "", max: 20, busy: false };

function kpRender() {
  var sl = $("kp-slots");
  sl.innerHTML = "";
  for (var k = 0; k < kp.buf.length; k++) {
    var c = document.createElement("i");
    c.textContent = kp.buf.charAt(k);
    c.className = "on";
    sl.appendChild(c);
  }
}
function openKeypad(i) {
  var a = ARSIP[i];
  if (!a || a.open) return;
  kp.i = i;
  kp.buf = "";
  kp.busy = false;
  $("kp-code").textContent = a.code;
  $("kp-t").textContent =
    i === 0
      ? "Tanggal lahir nya shio naga, lihat sekitarmu"
      : "File Terkunci";
  var sl = $("kp-slots");
  sl.innerHTML = "";
  sl.className = "kp-slots";
  $("kp-err").textContent = "";
  $("kp-err").className = "kp-err";
  var d = $("kp");
  d.classList.remove("out");
  d.hidden = false;
  kpRender();
}
function closeKeypad() {
  var d = $("kp");
  if (d.hidden || d.classList.contains("out")) return;
  d.classList.add("out");
  setTimeout(
    function () {
      d.hidden = true;
      d.classList.remove("out");
    },
    reduceMotion() ? 0 : 220,
  );
}
function kpPush(n) {
  if (kp.busy || kp.buf.length >= kp.max) return;
  kp.buf += n;
  kpRender();
}
function kpBack() {
  if (kp.busy) return;
  kp.buf = kp.buf.slice(0, -1);
  kpRender();
}
function kpClear() {
  if (kp.busy) return;
  kp.buf = "";
  kpRender();
}
function kpSubmit() {
  if (kp.busy || !kp.buf.length) return;
  var i = kp.i,
    a = ARSIP[i],
    sl = $("kp-slots"),
    er = $("kp-err"),
    m = reduceMotion() ? 0 : 1;
  kp.busy = true;
  er.className = "kp-err";
  er.textContent = "";
  decryptVault(a.vault, kp.buf).then(
    function (t) {
      applyFile(a, JSON.parse(t));
      saveOpen(a.code, kp.buf);
      sl.classList.add("ok");
      er.className = "kp-err good";
      er.textContent = "> segel dibuka";
      setTimeout(function () {
        closeKeypad();
        renderArsip();
        openFile(i, true);
      }, 800 * m);
    },
    function (e) {
      sl.classList.remove("bad");
      void sl.offsetWidth;
      sl.classList.add("bad");
      er.textContent =
        e && e.message === "nocrypto"
          ? "Browser ini tidak mendukung pembukaan segel."
          : "> KODE SALAH.";
      setTimeout(function () {
        kp.buf = "";
        sl.classList.remove("bad");
        kpRender();
        kp.busy = false;
      }, 700 * m);
    },
  );
}
(function () {
  var pad = $("kp-pad"),
    keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "\u232B"];
  keys.forEach(function (k) {
    var b = document.createElement("button");
    b.type = "button";
    b.textContent = k;
    if (k === "C" || k === "\u232B") b.className = "fn";
    b.setAttribute(
      "aria-label",
      k === "C" ? "Hapus semua" : k === "\u232B" ? "Hapus satu" : k,
    );
    b.onclick = function () {
      if (k === "C") kpClear();
      else if (k === "\u232B") kpBack();
      else kpPush(k);
    };
    pad.appendChild(b);
  });
  var ok = document.createElement("button");
  ok.type = "button";
  ok.className = "fn ok";
  ok.textContent = "BUKA";
  ok.setAttribute("aria-label", "Buka berkas");
  ok.onclick = kpSubmit;
  pad.appendChild(ok);
  $("kp-x").onclick = closeKeypad;
  $("kp").onclick = function (e) {
    if (e.target === $("kp")) closeKeypad();
  };
  document.addEventListener("keydown", function (e) {
    if ($("kp").hidden) return;
    if (/^[0-9]$/.test(e.key)) kpPush(e.key);
    else if (e.key === "Backspace") kpBack();
    else if (e.key === "Enter") kpSubmit();
    else if (e.key === "Escape") closeKeypad();
  });
})();