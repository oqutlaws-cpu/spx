/* Efek pembukaan: logo + log ala terminal + bar, lalu memudar. Ketuk untuk melewati.
   Ubah teks di LINES, lama tampil di TOTAL (ms). Hapus <div id="splash"> di index.html untuk mematikan. */
(function () {
  var el = document.getElementById("splash");
  if (!el) return;
  var LINES = [
    "&gt; MEMBUKA ARSIP SPECTRAL XDGE<b>...</b>",
    "&gt; MEMINDAI SIDIK JARI<b>...</b> OK",
    "&gt; GENERATION 06 <b>TERHUBUNG</b>",
  ];
  var TOTAL = reduceMotion() ? 600 : 3800;
  var log = el.querySelector(".sp-log");
  var done = false;

  document.body.classList.add("splash-on");
  LINES.forEach(function (t, i) {
    var d = document.createElement("div");
    d.innerHTML = t;
    d.style.animationDelay = 1.2 + i * 0.6 + "s";
    log.appendChild(d);
  });

  function close() {
    if (done) return;
    done = true;
    el.classList.add("out");
    document.body.classList.remove("splash-on");
    setTimeout(function () {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 1000);
  }
  el.addEventListener("click", close);
  document.addEventListener("keydown", close);
  setTimeout(close, TOTAL);
})();
