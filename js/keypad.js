/* Keypad kode angka: panel brankas untuk membuka berkas arsip (jawaban clue = kode angka) */

var kp = { i: -1, buf: "", len: 8, busy: false };

function kpRender() {
  var s = $("kp-slots").children;
  for (var k = 0; k < s.length; k++) {
    s[k].textContent = kp.buf.charAt(k);
    s[k].className = k < kp.buf.length ? "on" : "";
  }
}
function openKeypad(i) {
  var a = ARSIP[i];
  if (!a || a.open) return;
  kp.i = i;
  kp.buf = "";
  kp.busy = false;
  kp.len = a.len || 8;
  $("kp-code").textContent = a.code;
  $("kp-t").textContent =
    "Masukkan jawaban Clue " +
    clueLetter(i) +
    " (angka) untuk membuka " +
    a.code +
    ".";
  var sl = $("kp-slots");
  sl.innerHTML = "";
  sl.className = "kp-slots";
  for (var k = 0; k < kp.len; k++) sl.appendChild(document.createElement("i"));
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
  if (kp.busy || kp.buf.length >= kp.len) return;
  kp.buf += n;
  kpRender();
  if (kp.buf.length === kp.len) kpSubmit();
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
  $("kp-x").onclick = closeKeypad;
  $("kp").onclick = function (e) {
    if (e.target === $("kp")) closeKeypad();
  };
  document.addEventListener("keydown", function (e) {
    if ($("kp").hidden) return;
    if (/^[0-9]$/.test(e.key)) kpPush(e.key);
    else if (e.key === "Backspace") kpBack();
    else if (e.key === "Escape") closeKeypad();
  });
})();
