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
      openTeamCard(t);
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

/* ===== kartu anggota yang bisa dibalik (depan: foto, belakang: data) ===== */
var tf = { el: null, card: null };
function tfBuild() {
  if (tf.el) return;
  var o = document.createElement("div");
  o.className = "tf";
  o.id = "tf";
  o.hidden = true;
  o.innerHTML =
    '<div class="tf-stage">' +
    '<div class="tf-card" id="tf-card" tabindex="0" role="button" aria-label="Kartu anggota. Ketuk untuk membalik.">' +
    '<div class="tf-face tf-front">' +
    '<div class="tf-ph"><img alt="" hidden><svg class="tf-sil" viewBox="0 0 60 80" aria-hidden="true"><circle cx="30" cy="30" r="13"/><path d="M6 80c0-20 11-30 24-30s24 10 24 30z"/></svg></div>' +
    '<span class="tf-code"></span><em class="tf-bt"></em>' +
    '<div class="tf-nm"><b></b><span></span></div><i class="tf-hint">KETUK UNTUK MEMBALIK</i>' +
    "</div>" +
    '<div class="tf-face tf-back">' +
    '<div class="tf-bar"><span class="tf-code2"></span><span>ARSIP</span></div>' +
    '<div class="tf-body"><div class="tf-lbl">NAMA</div><h3 class="tf-n"></h3><div class="tf-lbl">PERAN</div><p class="tf-r"></p><div class="tf-lbl">GOL. DARAH</div><b class="tf-b"></b><div class="tf-lbl">CATATAN</div><p class="tf-bio"></p></div>' +
    '<div class="tf-bc" aria-hidden="true"></div><div class="tf-stamp">TERARSIP</div>' +
    "</div>" +
    "</div>" +
    '<div class="tf-ctrl"><button type="button" id="tf-flip">BALIK KARTU</button><button type="button" id="tf-close">TUTUP</button></div>' +
    "</div>";
  document.body.appendChild(o);
  tf.el = o;
  tf.card = o.querySelector(".tf-card");
  function flip() {
    tf.card.classList.toggle("flipped");
  }
  tf.card.onclick = flip;
  tf.card.onkeydown = function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      flip();
    }
  };
  o.querySelector("#tf-flip").onclick = flip;
  o.querySelector("#tf-close").onclick = closeTeamCard;
  o.onclick = function (e) {
    if (!e.target.closest(".tf-card, .tf-ctrl")) closeTeamCard();
  };
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !tf.el.hidden) closeTeamCard();
  });
}
function openTeamCard(t) {
  tfBuild();
  var c = tf.card,
    img = c.querySelector(".tf-ph img");
  c.classList.remove("flipped");
  if (t.img) {
    img.src = t.img;
    img.hidden = false;
    c.classList.add("has-img");
  } else {
    img.hidden = true;
    img.removeAttribute("src");
    c.classList.remove("has-img");
  }
  c.querySelector(".tf-code").textContent = t.code;
  c.querySelector(".tf-code2").textContent = "ARSIP " + t.code;
  c.querySelector(".tf-bt").textContent = t.blood;
  c.querySelector(".tf-nm b").textContent = t.name;
  c.querySelector(".tf-nm span").textContent = t.role;
  c.querySelector(".tf-n").textContent = t.name;
  c.querySelector(".tf-r").textContent = t.role;
  c.querySelector(".tf-b").textContent = t.blood;
  c.querySelector(".tf-bio").textContent = t.bio;
  tf.el.classList.remove("out");
  tf.el.hidden = false;
  document.body.style.overflow = "hidden";
}
function closeTeamCard() {
  var d = tf.el;
  if (!d || d.hidden || d.classList.contains("out")) return;
  d.classList.add("out");
  setTimeout(
    function () {
      d.hidden = true;
      d.classList.remove("out");
      document.body.style.overflow = "";
    },
    window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches
      ? 0
      : 220,
  );
}
