/* Prosedur terkunci: cek sandi, dekripsi isi (AES-GCM), urutan buka segel */

/* ===== prosedur terkunci: isi dienkripsi (AES-GCM), tidak terbaca di source ===== */
var procOpen = false;
function decryptProc(pw) {
  return decryptVault(VAULT, pw);
}
function logLine(t, c) {
  var d = document.createElement("div");
  d.textContent = t;
  if (c) d.className = c;
  $("pr-log").appendChild(d);
}
function openSeq(html) {
  var lock = $("pr-lock"),
    pl = lock.querySelector(".padlock");
  var k =
    window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches
      ? 0
      : 1;
  $("pr-form").style.display = "none";
  $("pr-log").innerHTML = "";
  [
    [0, "> memeriksa sandi..."],
    [450, "> sandi cocok"],
    [900, "> segel dibuka"],
  ].forEach(function (x) {
    setTimeout(function () {
      logLine(x[1], x[0] === 900 ? "good" : "");
      if (x[0] === 900) {
        lock.classList.add("ok");
        pl.classList.add("open");
      }
    }, x[0] * k);
  });
  setTimeout(function () {
    var body = $("pr-body");
    body.innerHTML = html;
    Array.prototype.forEach.call(
      body.querySelectorAll(".fs li"),
      function (li, i) {
        li.style.setProperty("--i", i);
      },
    );
    $("s-intro").classList.add("opened");
    lock.hidden = true;
    body.hidden = false;
    body.classList.add("play");
    procOpen = true;
    window.scrollTo(0, 0);
  }, 1900 * k);
}
function tryOpenProc() {
  var pw = $("pr-pw").value.trim().toLowerCase(),
    err = $("pr-err"),
    btn = $("pr-open"),
    lock = $("pr-lock");
  if (!pw) {
    err.textContent = "> SANDI KOSONG.";
    return;
  }
  btn.disabled = true;
  err.textContent = "";
  decryptProc(pw).then(openSeq, function (e) {
    btn.disabled = false;
    if (e && e.message === "nocrypto") {
      err.textContent =
        "Browser ini tidak mendukung pembukaan segel. Coba Chrome atau Safari terbaru.";
      return;
    }
    err.textContent = "> AKSES DITOLAK. Kata sandi salah.";
    lock.classList.remove("deny");
    void lock.offsetWidth;
    lock.classList.add("deny");
    $("pr-pw").select();
  });
}
$("pr-open").onclick = tryOpenProc;
$("pr-pw").onkeydown = function (e) {
  if (e.key === "Enter") tryOpenProc();
};
