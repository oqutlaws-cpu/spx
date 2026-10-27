/* Team Lineup: kartu anggota dan pop up detail */

function renderTeam() {
  var g = $("tl-grid");
  if (g.childNodes.length) return;
  TEAM.forEach(function (t, i) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "tc";
    b.style.setProperty("--i", i);
    b.innerHTML =
      '<span class="cd"></span><em class="bt"></em><span class="ph2"><svg viewBox="0 0 60 80" aria-hidden="true"><circle cx="30" cy="30" r="13"/><path d="M6 80c0-20 11-30 24-30s24 10 24 30z"/></svg><span class="no"></span></span><span class="nm"></span><span class="rl"></span>';
    b.querySelector(".cd").textContent = t.code;
    b.querySelector(".bt").textContent = t.blood;
    b.querySelector(".no").textContent = String(t.code).split("-").pop();
    b.querySelector(".nm").textContent = t.name;
    b.querySelector(".rl").textContent = t.role;
    if (t.img) {
      var pim = document.createElement("img");
      pim.src = t.img;
      pim.alt = "";
      var ph = b.querySelector(".ph2");
      ph.classList.add("has");
      ph.insertBefore(pim, ph.firstChild);
    }
    b.onclick = function () {
      var di = $("dp-img");
      if (t.img) {
        di.src = t.img;
        di.hidden = false;
      } else {
        di.hidden = true;
      }
      $("dp").classList.remove("arsip");
      $("dp-stamp").textContent = "TERARSIP";
      $("dp-code").textContent = "ARSIP " + t.code;
      $("dp-name").textContent = t.name;
      $("dp-role").textContent = t.role;
      $("dp-bp").style.display = "";
      $("dp-blood").textContent = t.blood;
      $("dp-bio").textContent = t.bio;
      $("dp").hidden = false;
    };
    g.appendChild(b);
  });
}

function closeDp() {
  var d = $("dp");
  if (d.hidden || d.classList.contains("out")) return;
  d.classList.add("out");
  setTimeout(
    function () {
      d.hidden = true;
      d.classList.remove("out");
    },
    window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches
      ? 0
      : 220,
  );
}
$("dp-close").onclick = function () {
  closeDp();
};
$("dp-x").onclick = function () {
  closeDp();
};
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape" && !$("dp").hidden) closeDp();
});
$("dp").onclick = function (e) {
  if (e.target === $("dp")) closeDp();
};
